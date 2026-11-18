
require("dotenv").config();

const express = require("express");
const db = require("./config/db");
const cors = require("cors");
const PORT = process.env.PORT || 3000;
const booksRoutes = require("./routes/booksRoute");
const studentsRoutes = require("./routes/studentsRoutes");
const issuedBooksRoutes = require("./routes/issuedBookRoutes");
const adminsRoute = require("./routes/adminRoute");
const app = express();

app.use(cors());
app.use(express.json());


app.use("/books", booksRoutes);
app.use("/students", studentsRoutes);
app.use("/issuedBooks", issuedBooksRoutes);
app.use("/admin", adminsRoute);

app.get("/", (req, res) => {
    res.send("Library Management System API is running");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

