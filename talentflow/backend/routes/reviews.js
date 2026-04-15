const express = require("express");
const { body, validationResult } = require("express-validator");
const Review = require("../models/Review");
const Company = require("../models/Company");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// GET /api/reviews/company/:companyId
router.get("/company/:companyId", async (req, res, next) => {
  try {
    const reviews = await Review.find({ company: req.params.companyId })
      .populate("reviewer", "name avatar")
      .sort("-createdAt");

    const company = await Company.findById(req.params.companyId, "averageRating totalReviews");

    res.json({
      success: true,
      reviews,
      stats: {
        averageRating: company?.averageRating || 0,
        totalReviews: company?.totalReviews || 0,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/reviews/company/:companyId — add review
router.post(
  "/company/:companyId",
  protect,
  authorize("candidate"),
  [
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be 1–5"),
    body("title").trim().notEmpty().withMessage("Review title is required"),
    body("comment").trim().notEmpty().withMessage("Comment is required"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
      }

      const company = await Company.findById(req.params.companyId);
      if (!company) return res.status(404).json({ success: false, message: "Company not found." });

      const existing = await Review.findOne({
        company: req.params.companyId,
        reviewer: req.user._id,
      });
      if (existing) {
        return res.status(409).json({ success: false, message: "You have already reviewed this company." });
      }

      const review = await Review.create({
        company: req.params.companyId,
        reviewer: req.user._id,
        ...req.body,
      });

      const populated = await Review.findById(review._id).populate("reviewer", "name avatar");

      res.status(201).json({ success: true, review: populated });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/reviews/:id
router.delete("/:id", protect, async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: "Review not found." });
    if (review.reviewer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }
    await review.deleteOne();
    res.json({ success: true, message: "Review deleted." });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
