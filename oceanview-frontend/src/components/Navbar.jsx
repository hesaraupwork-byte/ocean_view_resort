import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg ov-navbar sticky-top">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-3" to="/">
          <img src={logo} alt="Ocean View Resort" className="ov-logo" />
          <span className="ov-brand">Ocean View Resort</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center gap-2">
            <li className="nav-item">
              <Link className="nav-link ov-link" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link ov-link" to="/about">About</Link>
            </li>
            
            <li className="nav-item">
              <Link className="nav-link ov-link" to="/faq">FAQ</Link>
            </li>

            <li className="nav-item ms-lg-2">
              <Link className="btn ov-btn-outline" to="/login">Login</Link>
            </li>
            <li className="nav-item">
              <Link className="btn ov-btn" to="/register">Register</Link>
            </li>
            <li className="nav-item">
              <Link className="btn ov-btn-dark" to="/customer/reservations">
                Make Reservation
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}