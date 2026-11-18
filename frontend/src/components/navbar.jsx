import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const navigationLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/books", label: "Books" },
  { to: "/students", label: "Students" },
  { to: "/issued-books", label: "Issued Books" },
];

function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("admin");
    navigate("/");
  };

  return (
    <header className="app-header">
      <nav className="navbar" aria-label="Main navigation">
        <NavLink
          to="/dashboard"
          className="brand"
          onClick={() => setMenuOpen(false)}
        >
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M4.5 5.75c2.75-.8 5.25-.35 7.5 1.35v12c-2.25-1.7-4.75-2.15-7.5-1.35v-12Zm15 0c-2.75-.8-5.25-.35-7.5 1.35v12c2.25-1.7 4.75-2.15 7.5-1.35v-12Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="brand-copy">
            <strong>Page &amp; Pine</strong>
            <small>Library management</small>
          </span>
        </NavLink>

        <button
          type="button"
          className="menu-toggle"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((isOpen) => !isOpen)}
        >
          <span />
          <span />
          <span />
        </button>

        <div
          id="primary-navigation"
          className={`nav-content${menuOpen ? " nav-content-open" : ""}`}
        >
          <div className="nav-links">
            {navigationLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `nav-link${isActive ? " nav-link-active" : ""}`
                }
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </NavLink>
            ))}
          </div>
          <button type="button" onClick={handleLogout} className="logout-button">
            Log out
          </button>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
