require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/error");

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Health check
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    app: "TalentFlow+ API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "API is running" });
});

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/jobs", require("./routes/jobs"));
app.use("/api/companies", require("./routes/companies"));
app.use("/api/reviews", require("./routes/reviews"));

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found.` });
});

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 TalentFlow+ API running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🗄️  MongoDB: ${process.env.MONGO_URI}\n`);
});
