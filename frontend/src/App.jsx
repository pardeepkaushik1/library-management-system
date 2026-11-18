import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import Books from "./pages/books";
import Students from "./pages/student";
import IssuedBooks from "./pages/issuedBook";
import Navbar from "./components/navbar";
import { useLocation } from "react-router-dom";
import ProtectedRoute from "./components/protectedRout";

function App() {
  const location = useLocation();
  return (
    <>
      {location.pathname !== "/" && <Navbar />}

      <Routes>
        <Route path="/" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/books" element={<Books />} />
          <Route path="/students" element={<Students />} />
          <Route path="/issued-books" element={<IssuedBooks />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
