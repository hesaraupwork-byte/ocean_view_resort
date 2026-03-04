import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Footer() {
  return (
    <footer className="ov-footer-pro">
      <div className="container-fluid px-4">
        <div className="row g-4">
          <div className="col-12 col-md-4">
            <div className="d-flex align-items-center gap-2">
              <img src={logo} alt="logo" className="ov-footer-logo" />
              <div className="fw-bold">Ocean View Resort</div>
            </div>
            <p className="ov-footer-text mt-2">
              Reservation, Billing and Customer Management System for Ocean View Resort.
            </p>
          </div>

          <div className="col-6 col-md-2">
            <div className="ov-footer-title">Quick Links</div>
            <ul className="ov-footer-list">
              <li><Link to="/" className="ov-footer-link">Home</Link></li>
              <li><Link to="/about" className="ov-footer-link">About</Link></li>
              <li><Link to="/faq" className="ov-footer-link">FAQ</Link></li>
            </ul>
          </div>

          <div className="col-6 col-md-3">
            <div className="ov-footer-title">Account</div>
            <ul className="ov-footer-list">
              <li><Link to="/login" className="ov-footer-link">Login</Link></li>
              <li><Link to="/register" className="ov-footer-link">Register</Link></li>
              <li><Link to="/customer/reservations" className="ov-footer-link">Make Reservation</Link></li>
            </ul>
          </div>

          <div className="col-12 col-md-3">
            <div className="ov-footer-title">Contact</div>
            <div className="ov-footer-text">
              <div><i className="bi bi-geo-alt me-2" /> Galle, Sri Lanka</div>
              <div className="mt-2"><i className="bi bi-envelope me-2" /> restinoceanview@gmail.com</div>
            </div>
          </div>
        </div>

        <hr className="ov-footer-hr" />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2 pb-2">
          <div className="small ov-footer-muted">© 2026 Ocean View Resort. All Rights Reserved.</div>
          <div className="d-flex gap-3">
            <a className="ov-footer-social" href="#"><i className="bi bi-facebook" /></a>
            <a className="ov-footer-social" href="#"><i className="bi bi-instagram" /></a>
            <a className="ov-footer-social" href="#"><i className="bi bi-twitter-x" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}