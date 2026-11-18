
const express = require("express");
const router = express.Router();

const db = require("../config/db");
const authMiddleware = require("../middleware/authmiddleware");


// Get All Books with Pagination
router.get("/", (req, res) => {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    const countSql = "SELECT COUNT(*) AS totalBooks FROM books";

    db.query(countSql, (err, countResult) => {

        if (err) {
            return res.status(500).json({
                message: "Error counting books",
                error: err
            });
        }

        const totalBooks = countResult[0].totalBooks;
        const totalPages = Math.ceil(totalBooks / limit);

        const sql = "SELECT * FROM books LIMIT ? OFFSET ?";

        db.query(sql, [limit, offset], (err, result) => {

            if (err) {
                return res.status(500).json({
                    message: "Error fetching books",
                    error: err
                });
            }

            res.status(200).json({
                message: "Books fetched successfully",
                currentPage: page,
                limit: limit,
                totalBooks: totalBooks,
                totalPages: totalPages,
                books: result
            });

        });
    });
});

// Search books
router.get("/search", (req, res) => {
    const { search } = req.query;

    const sql = `
        SELECT * FROM books
        WHERE title LIKE ?
        OR author LIKE ?
        OR category LIKE ?
    `;

    const searchValue = `%${search || ""}%`;

    db.query(
        sql,
        [searchValue, searchValue, searchValue],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: "Error searching books",
                    error: err
                });
            }

            res.status(200).json({
                message: "Books search successful",
                books: result
            });
        }
    );
});

// Get Single Book
router.get("/:id", (req, res) => {
    const { id } = req.params;

    const sql = "SELECT * FROM books WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Error fetching book",
                error: err
            });
        }

        if (result.length === 0) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        res.status(200).json({
            message: "Book fetched successfully",
            book: result[0]
        });
    });
});

// Add a new book
router.post("/", authMiddleware, (req, res) => {
    const { title, author, category, quantity } = req.body;

    const sql = `
        INSERT INTO books (title, author, category, quantity)
        VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [title, author, category, quantity], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Error adding book",
                error: err
            });
        }

        res.status(201).json({
            message: "Book added successfully",
            bookId: result.insertId
        });
    });
});

// update books

// Update a book
router.put("/:id", authMiddleware, (req, res) => {
    const { id } = req.params;
    const { title, author, category, quantity } = req.body;

    const sql = `
        UPDATE books
        SET title = ?, author = ?, category = ?, quantity = ?
        WHERE id = ?
    `;

    db.query(sql, [title, author, category, quantity, id], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Error updating book",
                error: err
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        res.status(200).json({
            message: "Book updated successfully"
        });
    });
});

// Delete a book
router.delete("/:id", authMiddleware, (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM books WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Error deleting book",
                error: err
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        res.status(200).json({
            message: "Book deleted successfully"
        });
    });
});



module.exports = router;
