import { useState } from "react";
import API from "../service/api";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await API.post("/admin/login", {
        email,
        password,
      });

      sessionStorage.setItem("token", response.data.token);
      sessionStorage.setItem("admin", JSON.stringify(response.data.admin));

      setMessage("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">
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
          <h1 className="login-title">Page &amp; Pine</h1>
          <p className="login-subtitle">Sign in to manage your library</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="login-field">
            <label htmlFor="admin-email">Email</label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="form-control"
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="form-control"
              required
            />
          </div>

          <button
            type="submit"
            className="login-submit"
          >
            Login
          </button>

          {message && <p className="login-message">{message}</p>}
        </form>
      </section>
    </main>
  );
}

export default Login;
