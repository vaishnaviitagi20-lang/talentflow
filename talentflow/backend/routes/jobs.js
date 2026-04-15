const express = require("express");
const { body, validationResult } = require("express-validator");
const Job = require("../models/Job");
const Company = require("../models/Company");
const User = require("../models/User");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// GET /api/jobs — list with filters + search + pagination
router.get("/", async (req, res, next) => {
  try {
    const {
      search,
      field,
      location,
      jobType,
      isRemote,
      salaryMin,
      salaryMax,
      experienceLevel,
      page = 1,
      limit = 12,
      sort = "-createdAt",
    } = req.query;

    const query = { isActive: true };

    // Text search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { skills: { $in: [new RegExp(search, "i")] } },
      ];
    }

    if (field && field !== "all") query.field = field;
    if (location) query.location = { $regex: location, $options: "i" };
    if (jobType && jobType !== "all") query.jobType = jobType;
    if (isRemote === "true") query.isRemote = true;
    if (experienceLevel && experienceLevel !== "all") query.experienceLevel = experienceLevel;

    if (salaryMin || salaryMax) {
      query["salary.min"] = {};
      if (salaryMin) query["salary.min"].$gte = Number(salaryMin);
      if (salaryMax) query["salary.min"].$lte = Number(salaryMax);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate("company", "name logo location averageRating totalReviews isVerified")
        .populate("postedBy", "name")
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Job.countDocuments(query),
    ]);

    res.json({
      success: true,
      jobs,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/jobs/:id — single job detail
router.get("/:id", async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate("company")
      .populate("postedBy", "name email");

    if (!job || !job.isActive) {
      return res.status(404).json({ success: false, message: "Job not found." });
    }

    // Increment view count
    await Job.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    res.json({ success: true, job });
  } catch (err) {
    next(err);
  }
});

// POST /api/jobs — create job (employer only)
router.post(
  "/",
  protect,
  authorize("employer"),
  [
    body("title").trim().notEmpty().withMessage("Job title is required"),
    body("description").trim().notEmpty().withMessage("Description is required"),
    body("location").trim().notEmpty().withMessage("Location is required"),
    body("jobType").notEmpty().withMessage("Job type is required"),
    body("field").notEmpty().withMessage("Field is required"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
      }

      // Find employer's company
      const company = await Company.findOne({ owner: req.user._id });
      if (!company) {
        return res.status(400).json({ success: false, message: "Please set up your company profile first." });
      }

      const { salaryMin, salaryMax, salaryDisplay, ...rest } = req.body;

      const job = await Job.create({
        ...rest,
        salary: {
          min: salaryMin || 0,
          max: salaryMax || 0,
          display: salaryDisplay || "",
        },
        company: company._id,
        postedBy: req.user._id,
      });

      const populated = await Job.findById(job._id).populate("company");
      res.status(201).json({ success: true, job: populated });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/jobs/:id — update job
router.put("/:id", protect, authorize("employer"), async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: "Job not found." });
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to edit this job." });
    }

    const { salaryMin, salaryMax, salaryDisplay, ...rest } = req.body;
    if (salaryMin || salaryMax || salaryDisplay) {
      rest.salary = { min: salaryMin || 0, max: salaryMax || 0, display: salaryDisplay || "" };
    }

    const updated = await Job.findByIdAndUpdate(req.params.id, rest, { new: true, runValidators: true })
      .populate("company");

    res.json({ success: true, job: updated });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/jobs/:id
router.delete("/:id", protect, authorize("employer"), async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: "Job not found." });
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }
    await job.deleteOne();
    res.json({ success: true, message: "Job deleted." });
  } catch (err) {
    next(err);
  }
});

// POST /api/jobs/:id/apply — apply to job
router.post("/:id/apply", protect, authorize("candidate"), async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job || !job.isActive) {
      return res.status(404).json({ success: false, message: "Job not found." });
    }

    const alreadyApplied = job.applicants.some(
      (a) => a.user.toString() === req.user._id.toString()
    );
    if (alreadyApplied) {
      return res.status(409).json({ success: false, message: "You have already applied to this job." });
    }

    job.applicants.push({ user: req.user._id, coverLetter: req.body.coverLetter || "" });
    await job.save();

    await User.findByIdAndUpdate(req.user._id, {
      $push: { appliedJobs: { job: job._id } },
    });

    res.json({ success: true, message: "Application submitted successfully!" });
  } catch (err) {
    next(err);
  }
});

// POST /api/jobs/:id/save — toggle save job
router.post("/:id/save", protect, authorize("candidate"), async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: "Job not found." });

    const user = await User.findById(req.user._id);
    const isSaved = user.savedJobs.includes(req.params.id);

    if (isSaved) {
      user.savedJobs = user.savedJobs.filter((id) => id.toString() !== req.params.id);
      await user.save();
      return res.json({ success: true, saved: false, message: "Job removed from saved." });
    } else {
      user.savedJobs.push(req.params.id);
      await user.save();
      return res.json({ success: true, saved: true, message: "Job saved!" });
    }
  } catch (err) {
    next(err);
  }
});

// GET /api/jobs/employer/my — employer's own jobs
router.get("/employer/my", protect, authorize("employer"), async (req, res, next) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id })
      .populate("company", "name logo")
      .sort("-createdAt");
    res.json({ success: true, jobs, total: jobs.length });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
