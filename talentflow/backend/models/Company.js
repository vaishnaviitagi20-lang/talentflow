const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      maxlength: [200, "Company name too long"],
    },
    about: {
      type: String,
      default: "",
      maxlength: [2000, "About section too long"],
    },
    website: { type: String, default: "" },
    location: { type: String, default: "" },
    contactEmail: { type: String, default: "" },
    industry: { type: String, default: "" },
    size: {
      type: String,
      enum: ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+", ""],
      default: "",
    },
    logo: { type: String, default: "" },
    founded: { type: String, default: "" },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Aggregated review stats (denormalized for performance)
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Company", companySchema);
