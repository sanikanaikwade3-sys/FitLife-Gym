
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/register", (req, res) => {
    const { name, email, phone, age, plan, startDate, gender } = req.body;

    const errors = [];

    if (!name || !/^[A-Za-z\s.'-]{2,60}$/.test(name.trim())) {
        errors.push("Please enter a valid full name.");
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        errors.push("Please enter a valid email address.");
    }

    const mobile = String(phone || "").trim();

if (!/^\d{10}$/.test(mobile)) {
    errors.push("Mobile number must contain exactly 10 digits.");
}

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

    if (!["Basic", "Standard", "Premium"].includes(plan)) {
        errors.push("Please select a valid membership plan.");
    }

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

    if (!["Male", "Female", "Other"].includes(gender)) {
        errors.push("Please select a valid gender.");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            errors
        });
    }

    return res.status(201).json({
        success: true,
        message: "Registration successful! Welcome to FitLife Gym."
    });
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Requested route not found."
    });
});

app.listen(PORT, () => {
    console.log(`FitLife Gym running at http://localhost:${PORT}`);
});
