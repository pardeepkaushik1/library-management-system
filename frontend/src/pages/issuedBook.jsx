import { useEffect, useState } from "react";
import API from "../service/api";

function IssuedBooks() {
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [books, setBooks] = useState([]);
  const [students, setStudents] = useState([]);
  const [bookId, setBookId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [searchBook, setSearchBook] = useState("");
  const [status, setStatus] = useState("all");

  const fetchIssuedBooks = async () => {
    try {
      const response = await API.get("/issuedbooks");
      setIssuedBooks(response.data.issuedBooks);
    } catch (error) {
      alert("Failed to fetch issued books");
    }
  };
  const fetchFilteredBooks = async (selectedStatus) => {
    try {
      if (selectedStatus === "all") {
        fetchIssuedBooks();
      } else {
        const response = await API.get(
          `/issuedbooks/filter?status=${selectedStatus}`,
        );

        setIssuedBooks(response.data.issuedBooks);
      }
    } catch (error) {
      alert("Failed to filter issued books");
    }
  };
  const fetchBooks = async () => {
    try {
      const firstResponse = await API.get("/books?page=1&limit=100");

      let allBooks = firstResponse.data.books;
      const totalPages = firstResponse.data.totalPages;

      for (let page = 2; page <= totalPages; page++) {
        const response = await API.get(`/books?page=${page}&limit=100`);
        allBooks = [...allBooks, ...response.data.books];
      }

      setBooks(allBooks);
    } catch (error) {
      alert("Failed to fetch books");
    }
  };

  const fetchStudents = async () => {
    const response = await API.get("/students");
    setStudents(response.data.students);
  };
  const handleIssueBook = async (e) => {
    e.preventDefault();

    try {
      const token = sessionStorage.getItem("token");

      await API.post(
        "/issued-books",
        {
          book_id: bookId,
          student_id: studentId,
          issue_date: issueDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setBookId("");
      setStudentId("");
      setIssueDate("");

      fetchIssuedBooks();
      fetchBooks();

      alert("Book issued successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to issue book");
    }
  };
  const handleReturnBook = async (id) => {
    const confirmReturn = window.confirm(
      "Are you sure you want to return this book?",
    );

    if (!confirmReturn) return;

    try {
      const token = sessionStorage.getItem("token");

      await API.patch(
        `/issuedbooks/${id}/return`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      alert("Book returned successfully!");

      fetchIssuedBooks();
      fetchBooks();
    } catch (error) {
      console.log("Return Book Error:", error.response?.data || error);
      alert(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    fetchIssuedBooks();
    fetchBooks();
    fetchStudents();
  }, []);

  return (
    <main className="page-shell">
      <h1 className="page-heading">Issued Books</h1>
      <div className="panel">
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            fetchFilteredBooks(e.target.value);
          }}
          className="form-control"
        >
          <option value="all">All Books</option>
          <option value="issued">Issued Books</option>
          <option value="returned">Returned Books</option>
        </select>
      </div>
      <form
        onSubmit={handleIssueBook}
        className="panel form-grid"
      >
        <div className="relative">
          <input
            type="text"
            placeholder="Search book by name..."
            value={searchBook}
            onChange={(e) => {
              setSearchBook(e.target.value);
              setBookId("");
            }}
            className="form-control"
          />

          {searchBook && (
            <div className="absolute top-full left-0 w-full bg-white border rounded-lg shadow-lg max-h-52 overflow-y-auto z-10">
              {books.filter((book) =>
                book.title.toLowerCase().includes(searchBook.toLowerCase()),
              ).length === 0 ? (
                <p className="p-3 text-gray-500">No books found</p>
              ) : (
                books
                  .filter((book) =>
                    book.title.toLowerCase().includes(searchBook.toLowerCase()),
                  )
                  .map((book) => (
                    <div
                      key={book.id}
                      onClick={() => {
                        setBookId(book.id);
                        setSearchBook(book.title);
                      }}
                      className="p-3 hover:bg-gray-100 cursor-pointer"
                    >
                      {book.title} (Available: {book.quantity})
                    </div>
                  ))
              )}
            </div>
          )}
        </div>

        <select
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          required
          className="form-control"
        >
          <option value="">Select Student</option>

          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={issueDate}
          onChange={(e) => setIssueDate(e.target.value)}
          required
          className="form-control"
        />

        <input
          type="text"
          required
          value={bookId}
          className="hidden"
          onChange={() => {}}
        />
        <button
          type="submit"
          className="button-primary"
        >
          Issue Book
        </button>
      </form>
      <div className="table-panel">
        <div className="table-scroll">
          <table className="data-table issued-table">
          <thead>
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Book</th>
              <th className="p-4">Student</th>
              <th className="p-4">Issue Date</th>
              <th className="p-4">Return Date</th>
              <th className="p-4">Status</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {issuedBooks.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.book_title}</td>
                <td>{item.student_name}</td>
                <td>{item.issue_date}</td>
                <td>
                  {item.return_date ? (
                    <span className="returned-date">{item.return_date}</span>
                  ) : (
                    <span className="not-returned">Not Returned</span>
                  )}
                </td>
                <td>
                  <span
                    className={`status-badge${item.status === "issued" ? " status-badge-issued" : ""}`}
                  >
                    {item.status}
                  </span>
                </td>
                <td>
                  {item.status === "issued" && (
                    <button
                      onClick={() => handleReturnBook(item.id)}
                      className="button-success"
                    >
                      Return Book
                    </button>
                  )}

                  {item.status === "returned" && (
                    <span className="status-badge">Returned</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

export default IssuedBooks;
