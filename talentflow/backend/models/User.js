const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["candidate", "employer"],
      required: [true, "Role is required"],
    },
    // Candidate-specific fields
    resume: { type: String, default: "" },
    skills: [{ type: String }],
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
    appliedJobs: [
      {
        job: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
        appliedAt: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ["pending", "reviewed", "rejected", "accepted"],
          default: "pending",
        },
      },
    ],
    // Employer-specific fields
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
    avatar: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
