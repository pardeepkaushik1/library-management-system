import { useEffect, useState } from "react";
import API from "../service/api";

function Students() {
  const [students, setStudents] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [editStudentId, setEditStudentId] = useState(null);

  const fetchStudents = async () => {
    try {
      const response = await API.get("/students");
      setStudents(response.data.students);
    } catch (error) {
      console.log("Error fetching students:", error);
    }
  };
  const handleSubmitStudent = async (e) => {
    e.preventDefault();

    try {
      const token = sessionStorage.getItem("token");

      const studentData = {
        name,
        email,
        mobile,
        address,
      };

      if (editStudentId) {
        await API.put(`/students/${editStudentId}`, studentData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        alert("Student updated successfully!");
      } else {
        await API.post("/students", studentData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        alert("Student added successfully!");
      }

      setName("");
      setEmail("");
      setMobile("");
      setAddress("");
      setEditStudentId(null);

      fetchStudents();
    } catch (error) {
      alert(error.response?.data?.message || "Operation failed");
    }
  };
  const handleDeleteStudent = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this student?",
    );

    if (!confirmDelete) return;

    try {
      const token = sessionStorage.getItem("token");

      await API.delete(`/students/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Student deleted successfully!");

      fetchStudents();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete student");
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <main className="page-shell">
      <h1 className="page-heading">Students Management</h1>
      <form
        onSubmit={handleSubmitStudent}
        className="panel form-grid"
      >
        <input
          type="text"
          placeholder="Student Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="form-control"
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="form-control"
          required
        />

        <input
          type="text"
          placeholder="Mobile Number"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          className="form-control"
        />

        <input
          type="text"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="form-control"
        />

        <button
          type="submit"
          className="button-primary"
        >
          {editStudentId ? "Update Student" : "Add Student"}
        </button>
      </form>

      <div className="table-panel">
        <div className="table-scroll">
          <table className="data-table">
          <thead>
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Mobile</th>
              <th className="p-4">Address</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td>{student.id}</td>
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td>{student.mobile}</td>
                <td>{student.address}</td>
                <td>
                  <button
                    onClick={() => {
                      setEditStudentId(student.id);
                      setName(student.name);
                      setEmail(student.email || "");
                      setMobile(student.mobile || "");
                      setAddress(student.address || "");
                    }}
                    className="button-warning"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteStudent(student.id)}
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
      </div>
    </main>
  );
}

export default Students;
