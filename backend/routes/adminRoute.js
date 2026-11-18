
const express = require("express");
const router = express.Router();

const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Admin Login
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    const sql = "SELECT * FROM admins WHERE email = ?";

    db.query(sql, [email], async (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Database error"
            });
        }

        if (result.length === 0) {
            return res.status(404).json({
                message: "Admin not found"
            });
        }

        const admin = result[0];

        const isMatch = await bcrypt.compare(
            password,
            admin.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid password"
            });
        }

        const token = jwt.sign(
            {
                id: admin.id,
                role: "admin"
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            admin: {
                id: admin.id,
                name: admin.name,
                email: admin.email
            }
        });
    });
});

const authMiddleware = require("../middleware/authmiddleware");

// Admin Dashboard
router.get("/dashboard", authMiddleware, (req, res) => {
    res.status(200).json({
        message: "Welcome to Admin Dashboard",
        admin: req.admin
    });
});


// Dashboard Statistics
router.get("/stats", authMiddleware, (req, res) => {

    const sql = `
        SELECT
            (SELECT COUNT(*) FROM books) AS totalBooks,
            (SELECT COUNT(*) FROM students) AS totalStudents,
            (SELECT COUNT(*) FROM issued_books) AS totalIssuedRecords,
            (SELECT COUNT(*) FROM issued_books WHERE status = 'issued') AS currentlyIssued,
            (SELECT COUNT(*) FROM issued_books WHERE status = 'returned') AS returnedBooks
    `;

    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Error fetching dashboard statistics",
                error: err
            });
        }

        res.status(200).json({
            message: "Dashboard statistics fetched successfully",
            stats: result[0]
        });
    });
});

// Get Admin Profile
router.get("/profile", authMiddleware, (req, res) => {

    const sql = `
        SELECT id, name, email
        FROM admins
        WHERE id = ?
    `;

    db.query(sql, [req.admin.id], (err, result) => {

        if (err) {
            return res.status(500).json({
                message: "Error fetching admin profile"
            });
        }

        if (result.length === 0) {
            return res.status(404).json({
                message: "Admin not found"
            });
        }

        res.status(200).json({
            message: "Admin profile fetched successfully",
            admin: result[0]
        });

    });
});

// Admin Logout
router.post("/logout", authMiddleware, (req, res) => {

    res.status(200).json({
        message: "Admin logout successful"
    });

});

module.exports = router;
