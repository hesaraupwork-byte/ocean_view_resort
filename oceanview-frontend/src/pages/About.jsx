import { useState } from "react";
import aboutImg from "../assets/1.jpg";
import logo from "../assets/logo.png";

export default function About() {
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });

  function onChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setStatus({ type: "", msg: "" });

    try {
      setLoading(true);

      const payload = {
        customerName: form.customerName.trim(),
        customerEmail: form.customerEmail.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      };

      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let data = null;
        try {
          data = await res.json();
        } catch {
          // ignore json parse errors
        }

        const msg =
          data?.message ||
          (data?.fields ? "Please check your inputs." : "Failed to submit question.");

        throw new Error(msg);
      }

      setStatus({
        type: "success",
        msg: "Question submitted successfully. We will email you soon.",
      });

      setForm({
        customerName: "",
        customerEmail: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      setStatus({
        type: "error",
        msg: "" + (err.message || "Something went wrong."),
      });
    } finally {
      setLoading(false);
    }
  }

  function clearForm() {
    setForm({
      customerName: "",
      customerEmail: "",
      subject: "",
      message: "",
    });
  }

  return (
    <div className="ov-page">
      {/* HEADER */}
      <section className="ov-about-hero">
        <img src={aboutImg} alt="About Ocean View" className="ov-about-img" />
        <div className="ov-about-overlay" />

        <div className="container ov-about-hero-content">
          <div className="ov-about-hero-box">
            <div className="ov-about-kicker">ABOUT OCEAN VIEW RESORT</div>
            <h1 className="ov-about-title">
              Premium hospitality in <span className="accent">Sri Lanka</span>
            </h1>
            <p className="ov-about-sub">
              Ocean View Resort provides a luxury coastal experience with comfortable rooms,
              professional service, and a modern reservation & billing management system.
            </p>

            <div className="d-flex gap-3 flex-wrap mt-3">
              <div className="ov-about-pill">Luxury Rooms</div>
              <div className="ov-about-pill">Ocean View</div>
              <div className="ov-about-pill">24/7 Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* DETAILS */}
      <section className="ov-about-section">
        <div className="container">
          <div className="row g-4 align-items-stretch">
            {/* LEFT */}
            <div className="col-12 col-lg-7">
              <div className="ov-card-soft h-100">
                <div className="d-flex align-items-center gap-2">
                  <img src={logo} alt="logo" className="ov-mini-logo" />
                  <h4 className="m-0 ov-h4">Who we are</h4>
                </div>

                <p className="ov-p mt-3">
                  Ocean View Resort is designed to deliver a premium and relaxing stay experience.
                  Our system supports customers and staff through modern features such as:
                </p>

                <ul className="ov-list">
                  <li>Online reservation creation and management</li>
                  <li>Reservation confirmation workflow with email notifications</li>
                  <li>Billing management with tax, service charge, and discounts</li>
                  <li>Customer question submission and email replies</li>
                </ul>

                <div className="ov-divider" />

                <div className="row g-3">
                  <InfoBox title="Location" value="Galle, Sri Lanka" icon="bi-geo-alt" />
                  <InfoBox title="Email" value="restinoceanview@gmail.com" icon="bi-envelope" />
                  <InfoBox title="Support" value="Fast response via email" icon="bi-headset" />
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="col-12 col-lg-5">
              <div className="ov-card-soft h-100">
                <h4 className="ov-h4">Our Vision</h4>
                <p className="ov-p mt-2">
                  To become a leading luxury resort experience in Sri Lanka by providing excellent
                  customer service with modern digital management.
                </p>

                <h4 className="ov-h4 mt-4">Our Mission</h4>
                <p className="ov-p mt-2">
                  To simplify reservations, billing, and customer support while improving service
                  speed, accuracy, and guest satisfaction.
                </p>

                <div className="ov-divider" />

                <div className="ov-about-stats">
                  <Stat label="Room Types" value="Standard • Deluxe • Suite" />
                  <Stat label="System Modules" value="Reservations • Billing • Support" />
                  <Stat label="Email Updates" value="Pending • Confirmed • OTP" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEND QUESTION */}
      <section className="ov-about-section ov-about-bg">
        <div className="container">
          <div className="row g-4 align-items-center">
            <div className="col-12 col-lg-5">
              <h2 className="ov-h2 text-white">Have a question?</h2>
              <p className="text-white-50">
                Submit your question here. Our team will respond to your email.
              </p>

              <div className="ov-about-help">
                <div className="ov-about-help-item">
                  <i className="bi bi-envelope-check" />
                  <span>Email reply available</span>
                </div>
                <div className="ov-about-help-item">
                  <i className="bi bi-clock" />
                  <span>Fast response time</span>
                </div>
                <div className="ov-about-help-item">
                  <i className="bi bi-shield-lock" />
                  <span>Your data is protected</span>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-7">
              <div className="ov-form-card">
                <h4 className="ov-h4 mb-3">Send Question</h4>

                {status.msg && (
                  <div
                    className={`ov-alert ${
                      status.type === "success" ? "ov-alert-success" : "ov-alert-error"
                    }`}
                  >
                    {status.msg}
                  </div>
                )}

                <form onSubmit={submit}>
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="ov-label">Full Name</label>
                      <input
                        className="form-control ov-input"
                        name="customerName"
                        value={form.customerName}
                        onChange={onChange}
                        placeholder="Your name"
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="ov-label">Email</label>
                      <input
                        className="form-control ov-input"
                        type="email"
                        name="customerEmail"
                        value={form.customerEmail}
                        onChange={onChange}
                        placeholder="your@email.com"
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="ov-label">Subject</label>
                      <input
                        className="form-control ov-input"
                        name="subject"
                        value={form.subject}
                        onChange={onChange}
                        placeholder="e.g., Room pricing / Reservation issue"
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="ov-label">Message</label>
                      <textarea
                        className="form-control ov-input"
                        rows="5"
                        name="message"
                        value={form.message}
                        onChange={onChange}
                        placeholder="Type your question here..."
                        required
                      />
                    </div>

                    <div className="col-12 d-flex justify-content-end gap-2">
                      <button
                        type="button"
                        className="btn ov-btn-outline"
                        onClick={clearForm}
                      >
                        Clear
                      </button>

                      <button className="btn ov-btn-dark" disabled={loading}>
                        {loading ? "Sending..." : "Submit Question"}
                      </button>
                    </div>
                  </div>
                </form>

                <div className="ov-form-note">
                  Note: You will receive a reply to your email address.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoBox({ title, value, icon }) {
  return (
    <div className="col-12 col-md-4">
      <div className="ov-info">
        <div className="ov-info-ic">
          <i className={`bi ${icon}`} />
        </div>
        <div>
          <div className="ov-info-title">{title}</div>
          <div className="ov-info-value">{value}</div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="ov-stat">
      <div className="ov-stat-label">{label}</div>
      <div className="ov-stat-value">{value}</div>
    </div>
  );
}