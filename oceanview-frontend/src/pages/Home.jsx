import { Link } from "react-router-dom";
import { default as hero, default as room1, default as room2, default as room3 } from "../assets/hero.jpg";
import logo from "../assets/logo.png";

export default function Home() {
  return (
    <div className="ov-page">
      {/* NAVBAR */}
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
                <Link className="nav-link ov-link" to="/contact">Contact</Link>
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
                <Link className="btn ov-btn-dark" to="/reservations/new">
                  Make Reservation
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="ov-hero">
        <img src={hero} alt="OceanView" className="ov-hero-img" />
        <div className="ov-hero-overlay" />

        <div className="container-fluid ov-hero-content">
          <div className="ov-hero-text">
            <span className="ov-hero-small">WELCOME TO OCEAN VIEW RESORT</span>

            <h1 className="ov-hero-title">
              Luxury <span className="accent">Stay</span> & <br />
              Ocean <span className="accent">Experience</span>
            </h1>

            <p className="ov-hero-desc">
              Book rooms, manage reservations, billing, and customer requests with a modern system.
            </p>

            <div className="d-flex gap-3 flex-wrap">
              <Link className="btn ov-btn-dark px-4" to="/reservations/new">
                Get Started
              </Link>

              {/* ✅ Learn more now orange */}
              <Link className="btn ov-btn px-4" to="/about">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="ov-services">
        <div className="container-fluid text-center">
          <h2 className="ov-section-title">
            We provide modern & premium resort services
          </h2>
          <p className="ov-section-sub">
            Reservation management, email confirmations, billing automation, and customer support.
          </p>

          <div className="row g-4 mt-2 justify-content-center">
            <Card
              img={room1}
              title="Standard Room"
              text="Comfortable stay with essential facilities and clean experience."
            />
            <Card
              img={room2}
              title="Deluxe Room"
              text="Premium comfort with modern interior and better views."
            />
            <Card
              img={room3}
              title="Suite Room"
              text="Luxury suite with maximum space and resort-level service."
            />
          </div>

          <div className="mt-4">
            <Link className="btn ov-btn-light px-4" to="/reservations/new">
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="ov-features">
        <div className="container-fluid">
          <div className="row g-3">
            <Feature
              icon="bi-star-fill"
              title="Best Quality"
              text="Reliable service and professional user experience."
            />
            <Feature
              icon="bi-envelope-check-fill"
              title="Email Alerts"
              text="Automatic pending and confirmed reservation emails."
            />
            <Feature
              icon="bi-shield-lock-fill"
              title="Secure Access"
              text="Secure login and role-based access control."
            />
          </div>
        </div>
      </section>

      {/* ✅ PROFESSIONAL FOOTER */}
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
                <li><Link to="/contact" className="ov-footer-link">Contact</Link></li>
                <li><Link to="/faq" className="ov-footer-link">FAQ</Link></li>
              </ul>
            </div>

            <div className="col-6 col-md-3">
              <div className="ov-footer-title">Account</div>
              <ul className="ov-footer-list">
                <li><Link to="/login" className="ov-footer-link">Login</Link></li>
                <li><Link to="/register" className="ov-footer-link">Register</Link></li>
                <li><Link to="/reservations/new" className="ov-footer-link">Make Reservation</Link></li>
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
    </div>
  );
}

function Card({ img, title, text }) {
  return (
    <div className="col-12 col-md-6 col-lg-4">
      <div className="ov-card">
        <img src={img} alt={title} className="ov-card-img" />
        <div className="ov-card-body">
          <h5 className="ov-card-title">{title}</h5>
          <p className="ov-card-text">{text}</p>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div className="col-12 col-md-4">
      <div className="ov-feature">
        <i className={`bi ${icon}`} />
        <h6 className="mt-2 mb-1">{title}</h6>
        <p className="mb-0">{text}</p>
      </div>
    </div>
  );
}