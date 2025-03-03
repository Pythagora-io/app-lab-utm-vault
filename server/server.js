// Load environment variables
require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const basicRoutes = require("./routes/index");
const authRoutes = require("./routes/authRoutes");
const utmRoutes = require('./routes/utmRoutes');
const dropdownValueRoutes = require('./routes/dropdownValueRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const googleAuthRoutes = require('./routes/googleAuthRoutes');
const googlePropertyRoutes = require('./routes/googlePropertyRoutes');
const organizationRoutes = require('./routes/organizationRoutes');
const { connectDB } = require("./config/database");
const cors = require("cors");

if (!process.env.DATABASE_URL) {
  console.error("Error: DATABASE_URL variables in .env missing.");
  process.exit(-1);
}

const app = express();
const port = process.env.PORT || 3000;
// Pretty-print JSON responses
app.enable('json spaces');
// We want to be consistent with URL paths, so we enable strict routing
app.enable('strict routing');

app.use(cors({}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_session_secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.DATABASE_URL,
    ttl: 24 * 60 * 60 // Session TTL of 1 day
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 1 day in milliseconds
  }
}));

// Authentication routes
app.use(authRoutes);

// Database connection
connectDB();

app.on("error", (error) => {
  console.error(`Server error: ${error.message}`);
  console.error(error.stack);
});

// Basic Routes
app.use(basicRoutes);
// Authentication Routes
app.use('/api/auth', authRoutes);
// UTM Routes
app.use('/api/utm', utmRoutes);
// Dropdown Value Routes
app.use('/api/utm', dropdownValueRoutes);
// Analytics Routes
app.use('/api/analytics', analyticsRoutes);
// Google Auth Routes
app.use('/api', googleAuthRoutes);
// Google Property Routes
app.use('/api/google', googlePropertyRoutes);
// Organization Routes
app.use('/api/organization', organizationRoutes);

// If no routes handled the request, it's a 404
app.use((req, res, next) => {
  res.status(404).send("Page not found.");
});

// Error handling
app.use((err, req, res, next) => {
  console.error(`Unhandled application error: ${err.message}`);
  console.error(err.stack);
  res.status(500).send("There was an error serving your request.");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});