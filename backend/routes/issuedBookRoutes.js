const express = require("express");
const router = express.Router();

const db = require("../config/db");
const authMiddleware = require("../middleware/authmiddleware");

// Get all issued books with student and book details
router.get("/", (req, res) => {
  const sql = `
        SELECT
            issued_books.id,
            books.title AS book_title,
            students.name AS student_name,
            issued_books.issue_date,
            issued_books.return_date,
            issued_books.status
        FROM issued_books
        JOIN books ON issued_books.book_id = books.id
        JOIN students ON issued_books.student_id = students.id
    `;

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Error fetching issued books",
        error: err,
      });
    }

    res.status(200).json({
      message: "Issued books fetched successfully",
      issuedBooks: result,
    });
  });
});

// Filter Issued Books by Status
router.get("/filter", (req, res) => {
    const { status } = req.query;

    if (!["issued", "returned"].includes(status)) {
        return res.status(400).json({
            message: "Invalid status. Use issued or returned"
        });
    }

    const sql = `
        SELECT
            issued_books.id,
            books.title AS book_title,
            students.name AS student_name,
            issued_books.issue_date,
            issued_books.return_date,
            issued_books.status
        FROM issued_books
        JOIN books ON issued_books.book_id = books.id
        JOIN students ON issued_books.student_id = students.id
        WHERE issued_books.status = ?
    `;

    db.query(sql, [status], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Error filtering issued books",
                error: err
            });
        }

        res.status(200).json({
            message: "Issued books filtered successfully",
            issuedBooks: result
        });
    });
});

// Issue a book to a student

router.post("/", authMiddleware, (req, res) => {
    const { book_id, student_id, issue_date, return_date } = req.body;

    db.beginTransaction((err) => {
        if (err) {
            return res.status(500).json({ message: "Transaction failed" });
        }

        const checkSql = `
            SELECT quantity FROM books WHERE id = ? FOR UPDATE
        `;

        db.query(checkSql, [book_id], (err, result) => {
            if (err || result.length === 0) {
                return db.rollback(() => {
                    res.status(err ? 500 : 404).json({
                        message: err ? "Database error" : "Book not found"
                    });
                });
            }

            if (result[0].quantity <= 0) {
                return db.rollback(() => {
                    res.status(400).json({
                        message: "Book is out of stock"
                    });
                });
            }

            const insertSql = `
                INSERT INTO issued_books
                (book_id, student_id, issue_date, return_date, status)
                VALUES (?, ?, ?, ?, 'issued')
            `;

            db.query(
                insertSql,
                [book_id, student_id, issue_date, return_date || null],
                (err, insertResult) => {
                    if (err) {
                        return db.rollback(() => {
                            res.status(500).json({
                                message: "Error issuing book"
                            });
                        });
                    }

                    db.query(
                        "UPDATE books SET quantity = quantity - 1 WHERE id = ?",
                        [book_id],
                        (err) => {
                            if (err) {
                                return db.rollback(() => {
                                    res.status(500).json({
                                        message: "Error updating quantity"
                                    });
                                });
                            }

                            db.commit((err) => {
                                if (err) {
                                    return db.rollback(() => {
                                        res.status(500).json({
                                            message: "Transaction commit failed"
                                        });
                                    });
                                }

                                res.status(201).json({
                                    message: "Book issued successfully",
                                    issuedBookId: insertResult.insertId
                                });
                            });
                        }
                    );
                }
            );
        });
    });
});


// Return a book

router.patch("/:id/return", authMiddleware, (req, res) => {
    const { id } = req.params;

    db.beginTransaction((err) => {
        if (err) {
            return res.status(500).json({
                message: "Transaction failed"
            });
        }

        const sql = `
            UPDATE issued_books
            SET status = 'returned',
                return_date = CURDATE()
            WHERE id = ? AND status = 'issued'
        `;

        db.query(sql, [id], (err, result) => {
            if (err || result.affectedRows === 0) {
                return db.rollback(() => {
                    res.status(err ? 500 : 404).json({
                        message: err
                            ? "Error returning book"
                            : "Book not found or already returned"
                    });
                });
            }

            db.query(
                `UPDATE books
                 SET quantity = quantity + 1
                 WHERE id = (SELECT book_id FROM issued_books WHERE id = ?)`,
                [id],
                (err) => {
                    if (err) {
                        return db.rollback(() => {
                            res.status(500).json({
                                message: "Error updating book quantity"
                            });
                        });
                    }

                    db.commit((err) => {
                        if (err) {
                            return db.rollback(() => {
                                res.status(500).json({
                                    message: "Transaction commit failed"
                                });
                            });
                        }

                        res.status(200).json({
                            message: "Book returned successfully"
                        });
                    });
                }
            );
        });
    });
});


module.exports = router;
