import { useEffect, useState } from "react";
import API from "../service/api";

function Books() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [editBookId, setEditBookId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBooks = async () => {
    try {
      const response = await API.get(`/books?page=${page}&limit=5`);

      setBooks(response.data.books);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.log("Error fetching books:", error);
    }
  };
  const handleSubmitBook = async (e) => {
    e.preventDefault();

    try {
      const token = sessionStorage.getItem("token");

      const bookData = {
        title,
        author,
        category,
        quantity: Number(quantity),
      };

      if (editBookId) {
        await API.put(`/books/${editBookId}`, bookData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        alert("Book updated successfully!");
      } else {
        await API.post("/books", bookData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        alert("Book added successfully!");
      }

      setTitle("");
      setAuthor("");
      setCategory("");
      setQuantity("");
      setEditBookId(null);

      fetchBooks();
    } catch (error) {
      alert(error.response?.data?.message || "Operation failed");
    }
  };

  // dlete book
  const handleDeleteBook = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this book?",
    );

    if (!confirmDelete) return;

    try {
      const token = sessionStorage.getItem("token");

      await API.delete(`/books/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchBooks();

      alert("Book deleted successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete book");
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [page]);

  return (
    <main className="page-shell">
      <h1 className="page-heading">Books Management</h1>
      <form
        onSubmit={handleSubmitBook}
        className="panel form-grid"
      >
        <input
          type="text"
          placeholder="Book Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="form-control"
          required
        />

        <input
          type="text"
          placeholder="Author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="form-control"
          required
        />

        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="form-control"
        />

        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="form-control"
          required
        />

        <button className="button-primary" type="submit">
          {editBookId ? "Update Book" : "Add Book"}
        </button>
      </form>

      <div className="table-panel">
        <div className="table-scroll">
          <table className="data-table">
          <thead>
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Title</th>
              <th className="p-4">Author</th>
              <th className="p-4">Category</th>
              <th className="p-4">Quantity</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {books.map((book) => (
              <tr key={book.id}>
                <td>{book.id}</td>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.category}</td>
                <td>{book.quantity}</td>
                <td>
                  <button
                    onClick={() => {
                      setEditBookId(book.id);
                      setTitle(book.title);
                      setAuthor(book.author);
                      setCategory(book.category || "");
                      setQuantity(book.quantity);
                    }}
                    className="button-warning"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteBook(book.id)}
                    className="button-danger"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
        <div className="pagination">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="button-secondary"
          >
            Previous
          </button>

          <span>
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className="button-secondary"
          >
            Next
          </button>
        </div>
      </div>
    </main>
  );
}

export default Books;
