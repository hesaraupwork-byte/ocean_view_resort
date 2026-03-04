import { Link } from "react-router-dom";
import { default as hero, default as room1, default as room2, default as room3 } from "../assets/hero.jpg";

export default function Home() {
  return (
    <>
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
    </>
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