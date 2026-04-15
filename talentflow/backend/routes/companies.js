const express = require("express");
const Company = require("../models/Company");
const Job = require("../models/Job");
const Review = require("../models/Review");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// GET /api/companies — list all companies
router.get("/", async (req, res, next) => {
  try {
    const companies = await Company.find()
      .populate("owner", "name email")
      .sort("-createdAt");
    res.json({ success: true, companies });
  } catch (err) {
    next(err);
  }
});

// GET /api/companies/:id — company profile + jobs
router.get("/:id", async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id).populate("owner", "name email");
    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found." });
    }

    const jobs = await Job.find({ company: req.params.id, isActive: true })
      .sort("-createdAt")
      .limit(20);

    const reviews = await Review.find({ company: req.params.id })
      .populate("reviewer", "name avatar")
      .sort("-createdAt")
      .limit(10);

    res.json({ success: true, company, jobs, reviews });
  } catch (err) {
    next(err);
  }
});

// PUT /api/companies/:id — update company (owner only)
router.put("/:id", protect, authorize("employer"), async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ success: false, message: "Company not found." });
    if (company.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }

    const allowed = ["name", "about", "website", "location", "contactEmail", "industry", "size", "logo", "founded"];
    const updates = {};
    allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const updated = await Company.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    res.json({ success: true, company: updated });
  } catch (err) {
    next(err);
  }
});

// POST /api/companies/:id/contact — contact employer
router.post("/:id/contact", protect, async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id).populate("owner", "email name");
    if (!company) return res.status(404).json({ success: false, message: "Company not found." });

    const { subject, message } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ success: false, message: "Subject and message are required." });
    }

    // In production: send real email via nodemailer
    // For now: return success with contact info
    res.json({
      success: true,
      message: "Message sent to employer!",
      contactEmail: company.contactEmail || company.owner.email,
      note: "In production, this sends an email to the employer.",
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
