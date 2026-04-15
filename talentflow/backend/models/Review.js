const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    title: {
      type: String,
      required: [true, "Review title is required"],
      trim: true,
      maxlength: [200, "Title too long"],
    },
    comment: {
      type: String,
      required: [true, "Review comment is required"],
      maxlength: [2000, "Comment too long"],
    },
    pros: { type: String, default: "" },
    cons: { type: String, default: "" },
    isAnonymous: { type: Boolean, default: false },
    employmentStatus: {
      type: String,
      enum: ["current", "former", ""],
      default: "",
    },
  },
  { timestamps: true }
);

// One review per user per company
reviewSchema.index({ company: 1, reviewer: 1 }, { unique: true });

// After saving a review, update company's average rating
reviewSchema.post("save", async function () {
  const Company = require("./Company");
  const Review = this.constructor;
  const stats = await Review.aggregate([
    { $match: { company: this.company } },
    { $group: { _id: "$company", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  if (stats.length > 0) {
    await Company.findByIdAndUpdate(this.company, {
      averageRating: Math.round(stats[0].avg * 10) / 10,
      totalReviews: stats[0].count,
    });
  }
});

module.exports = mongoose.model("Review", reviewSchema);
