require('dotenv').config();
const express = require('express');
const app= express();
const cors = require('cors');
const connection = require('./db');
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const reminderRoutes = require("./routes/reminders")

connection();

app.use(express.json());
app.use(cors());

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/reminders", reminderRoutes)


app.use((err, req, res, next) => {
    // Handle and send error response
    console.error(err.stack); // Log the error for debugging
    res.status(500).json({ error: 'Internal Server Error' });
  });

// Middleware to verify JWT token and extract user ID
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  jwt.verify(token, yourSecretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Token verification failed" });
    }

    // Store the user ID in the request object for later use
    req.userId = decoded.userId;
    next();
  });
};



const port = process.env.PORT || 8080;
app.listen(port,()=> console.log(`Listening on port ${port}...`));
