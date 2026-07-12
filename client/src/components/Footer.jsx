import {
  FiShield,
  FiFacebook,
  FiTwitter,
  FiInstagram,
} from "react-icons/fi"

import "../styles/footer.css"

import { Link } from "react-router-dom";

function DashboardFooter() {
  return (
    <footer className="dashboard-footer">

      <div className="dashboard-footer-grid">

        {/* BRAND */}
        <div>

          <div className="dashboard-footer-logo">

            <FiShield />

            <h2>
              Lost & Found NG
            </h2>

          </div>

          <p>
            The premium recovery platform connecting Nigeria.
            Report lost items, find what matters,
            and rebuild trust in our community.
          </p>

          <div className="dashboard-footer-socials">
            <a
              href="https://facebook.com/lostfoundng"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FiFacebook />
            </a>

            <a
              href="https://x.com/lostfoundng"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FiTwitter />
            </a>

            <a
              href="https://instagram.com/lostfoundng"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FiInstagram />
            </a>

          </div>

        </div>

        {/* PLATFORM */}
        <div>

          <h3>Platform</h3>

          <Link to="/reports">Browse Reports</Link>

          <Link to="/how-it-works">How It Works</Link>

          <Link to="/success-stories">Success Stories</Link>

          <Link to="/safety">Safety Center</Link>

          <Link to="/help">Help Center</Link>

          <Link to="/contact">Contact Us</Link>

          <Link to="/report-fraud">Report Fraud</Link>

          <Link to="/privacy-policy">Privacy Policy</Link>

        </div>

        {/* SUPPORT */}
        <div>

          <h3>Support</h3>

          <Link to="/support">Help Center</Link>
          <Link to="/support">Contact Us</Link>
          <Link to="/support">Report Fraud</Link>
          <Link to="/privacy-policy">Privacy Policy</Link>

        </div>

        {/* NEWSLETTER */}
        <div>

          <h3>Newsletter</h3>

          <p>
            Stay updated on recovery alerts in your area.
          </p>

          <div className="newsletter-box">

            <input
              type="email"
              placeholder="Email address"
            />

            <button>
              Join
            </button>

          </div>

        </div>

      </div>

      {/* BOTTOM */}
      <div className="dashboard-footer-bottom">

        <p>
          © 2026 Lost & Found NG.
          Built with trust in Lagos, Nigeria.
        </p>

      </div>

    </footer>
  )
}

export default DashboardFooter