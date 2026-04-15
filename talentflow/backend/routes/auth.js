const express = require("express");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const Company = require("../models/Company");
const { protect } = require("../middleware/auth");

const router = express.Router();

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

const sendToken = (user, statusCode, res) => {
  const token = generateToken(user._id);
  const userData = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    company: user.company,
    savedJobs: user.savedJobs,
  };
  res.status(statusCode).json({ success: true, token, user: userData });
};

// POST /api/auth/register
router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("role").isIn(["candidate", "employer"]).withMessage("Role must be candidate or employer"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
      }

      const { name, email, password, role, companyName, companyLocation, companyWebsite, companyAbout } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ success: false, message: "An account with this email already exists." });
      }

      const user = await User.create({ name, email, password, role });

      // If employer, create a company profile
      if (role === "employer") {
        const company = await Company.create({
          name: companyName || `${name}'s Company`,
          location: companyLocation || "",
          website: companyWebsite || "",
          about: companyAbout || "",
          contactEmail: email,
          owner: user._id,
        });
        user.company = company._id;
        await user.save();
      }

      const populatedUser = await User.findById(user._id).populate("company");
      sendToken(populatedUser, 201, res);
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/auth/login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
      }

      const { email, password } = req.body;

      const user = await User.findOne({ email })
        .select("+password")
        .populate("company");

      if (!user) {
        return res.status(401).json({ success: false, message: "Invalid email or password." });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: "Invalid email or password." });
      }

      if (!user.isActive) {
        return res.status(401).json({ success: false, message: "Account has been deactivated." });
      }

      sendToken(user, 200, res);
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/auth/me — get current user
router.get("/me", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("company")
      .populate("savedJobs", "title company location jobType salary")
      .populate({ path: "appliedJobs.job", select: "title company location jobType" });
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
});

// PUT /api/auth/me — update profile
router.put("/me", protect, async (req, res, next) => {
  try {
    const allowed = ["name", "skills", "resume", "avatar"];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).populate("company");
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
