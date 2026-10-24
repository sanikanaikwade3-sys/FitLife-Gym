
const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Replace this with your actual GitHub Pages origin
app.use(cors({
    origin: "https://sanikanaikwade3-sys.github.io"
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files if needed
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Gym registration with server-side validation
app.post("/register", (req, res) => {
    const {
        name,
        email,
        phone,
        age,
        plan,
        startDate,
        gender
    } = req.body;

    const errors = [];

    // Validate name
    if (!name || !/^[A-Za-z\s.'-]{2,60}$/.test(name.trim())) {
        errors.push("Please enter a valid full name.");
    }

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        errors.push("Please enter a valid email address.");
    }

    // Validate mobile number
    const mobile = String(phone || "").trim();

    if (!/^\d{10}$/.test(mobile)) {
        errors.push("Mobile number must contain exactly 10 digits.");
    }

    // Validate age
    const memberAge = Number(age);

    if (
        age === undefined ||
        age === "" ||
        !Number.isInteger(memberAge) ||
        memberAge < 16 ||
        memberAge > 100
    ) {
        errors.push("Age must be between 16 and 100.");
    }

    // Validate membership plan
    if (!["Basic", "Standard", "Premium"].includes(plan)) {
        errors.push("Please select a valid membership plan.");
    }

    // Validate start date
    if (!startDate || !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
        errors.push("Please select a valid start date.");
    } else {
        const selectedDate = new Date(startDate + "T00:00:00Z");
        const today = new Date();

        today.setUTCHours(0, 0, 0, 0);

        if (
            Number.isNaN(selectedDate.getTime()) ||
            selectedDate.toISOString().slice(0, 10) !== startDate
        ) {
            errors.push("Please enter a valid start date.");
        } else if (selectedDate < today) {
            errors.push("Start date cannot be in the past.");
        }
    }

    // Validate gender
    if (!["Male", "Female", "Other"].includes(gender)) {
        errors.push("Please select a valid gender.");
    }

    // Return validation errors
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            errors
        });
    }

    // Return success response
    return res.status(201).json({
        success: true,
        message: "Registration successful! Welcome to FitLife Gym."
    });
});

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Requested route not found."
    });
});

app.listen(PORT, () => {
    console.log(`FitLife Gym server running on port ${PORT}`);
});
