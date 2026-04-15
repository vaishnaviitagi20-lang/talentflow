const mongoose = require("mongoose");

const JOB_FIELDS = [
  "IT",
  "Core Engineering",
  "Finance",
  "Marketing",
  "Healthcare",
  "Education",
  "Sales",
  "Design",
  "HR",
  "Legal",
  "Operations",
  "Other",
];

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      maxlength: [200, "Title too long"],
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
      maxlength: [10000, "Description too long"],
    },
    requirements: { type: String, default: "" },
    responsibilities: { type: String, default: "" },
    salary: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      currency: { type: String, default: "USD" },
      display: { type: String, default: "" }, // e.g. "$60k–$80k/yr"
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    isRemote: { type: Boolean, default: false },
    jobType: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Internship", "Freelance"],
      required: [true, "Job type is required"],
    },
    field: {
      type: String,
      enum: JOB_FIELDS,
      required: [true, "Job field is required"],
    },
    experienceLevel: {
      type: String,
      enum: ["Entry", "Mid", "Senior", "Lead", "Executive"],
      default: "Mid",
    },
    skills: [{ type: String }],
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    applicants: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        appliedAt: { type: Date, default: Date.now },
        coverLetter: { type: String, default: "" },
        status: {
          type: String,
          enum: ["pending", "reviewed", "rejected", "accepted"],
          default: "pending",
        },
      },
    ],
    savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isActive: { type: Boolean, default: true },
    deadline: { type: Date },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Text index for search
jobSchema.index({
  title: "text",
  description: "text",
  "company.name": "text",
  skills: "text",
});

module.exports = mongoose.model("Job", jobSchema);
