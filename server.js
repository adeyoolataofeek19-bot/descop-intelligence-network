require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: process.env.FRONTEND_ORIGIN || true
}));

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        name: "DESCOP Intelligence Network",
        status: "online",
        message: "DESCOP backend is running."
    });
});

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        status: "healthy",
        service: "DESCOP API"
    });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`DESCOP backend running on port ${PORT}`);
});
