
const express = require("express");
const router = express.Router();

const db = require("../config/db");
const authMiddleware = require("../middleware/authmiddleware");

// Get all students
router.get("/", (req, res) => {
    const sql = "SELECT * FROM students";

    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Error fetching students",
                error: err
            });
        }

        res.status(200).json({
            message: "Students fetched successfully",
            students: result
        });
    });
});

// Search Students
router.get("/search", (req, res) => {
    const { search } = req.query;

    const sql = `
        SELECT * FROM students
        WHERE name LIKE ?
        OR email LIKE ?
        OR mobile LIKE ?
    `;

    const searchValue = `%${search || ""}%`;

    db.query(sql, [searchValue, searchValue, searchValue], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Error searching students",
                error: err
            });
        }

        res.status(200).json({
            message: "Students search successful",
            students: result
        });
    });
});

// Add a new student
router.post("/", authMiddleware, (req, res) => {
    const { name, email, mobile, address } = req.body;

    const sql = `
        INSERT INTO students (name, email, mobile, address)
        VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [name, email, mobile, address], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Error adding student",
                error: err
            });
        }

        res.status(201).json({
            message: "Student added successfully",
            studentId: result.insertId
        });
    });
});

// Update a student
router.put("/:id", authMiddleware, (req, res) => {
    const { id } = req.params;
    const { name, email, mobile, address } = req.body;

    const sql = `
        UPDATE students
        SET name = ?, email = ?, mobile = ?, address = ?
        WHERE id = ?
    `;

    db.query(sql, [name, email, mobile, address, id], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Error updating student",
                error: err
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.status(200).json({
            message: "Student updated successfully"
        });
    });
});


// Delete a student
router.delete("/:id", authMiddleware, (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM students WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Error deleting student",
                error: err
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.status(200).json({
            message: "Student deleted successfully"
        });
    });
});




module.exports = router;
