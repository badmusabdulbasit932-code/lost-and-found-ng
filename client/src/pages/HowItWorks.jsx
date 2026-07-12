import {
  FiShield,
  FiSearch,
  FiCamera,
  FiMessageCircle,
  FiCheckCircle,
  FiArrowRight,
  FiMapPin,
  FiLock,
  FiUserCheck,
  FiHeart,
  FiMenu,
  FiX,
} from "react-icons/fi"

import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"

import Footer from "../components/Footer"

import "../styles/how-it-works.css"

function HowItWorks() {

  const navigate = useNavigate()

  const [mobileMenu, setMobileMenu] = useState(false)

  const steps = [
    {
      id: 1,
      icon: <FiCamera />,
      title: "Create A Report",
      text:
        "Upload photos and provide detailed information about the item you lost or found.",
    },

    {
      id: 2,
      icon: <FiSearch />,
      title: "Smart Matching",
      text:
        "Our intelligent system scans thousands of reports to discover possible matches instantly.",
    },

    {
      id: 3,
      icon: <FiMessageCircle />,
      title: "Secure Communication",
      text:
        "Owners and finders communicate safely through our private messaging system.",
    },

    {
      id: 4,
      icon: <FiCheckCircle />,
      title: "Verify & Recover",
      text:
        "Confirm ownership securely and arrange safe recovery of the item.",
    },
  ]

  const safety = [
    {
      icon: <FiShield />,
      title: "Verified Users",
      text:
        "Phone and identity verification reduce fake claims and fraud.",
    },

    {
      icon: <FiLock />,
      title: "Private Messaging",
      text:
        "Your contact details remain protected until verification is complete.",
    },

    {
      icon: <FiUserCheck />,
      title: "Ownership Proof",
      text:
        "Claimants must provide evidence before item handover.",
    },

    {
      icon: <FiHeart />,
      title: "Community Trust",
      text:
        "Thousands of Nigerians already use the platform daily.",
    },
  ]

  return (

    <>

      {/* ================= NAVBAR ================= */}

      <header className="navbar">

        <div className="logo-area">

          <div className="logo-box">
            <FiShield />
          </div>

          <h2>
            Lost & Found NG
          </h2>

        </div>

        <nav className={mobileMenu ? "nav-links active-nav" : "nav-links"}>

          <Link to="/">
            Home
          </Link>

          <Link to="/browse">
            Browse
          </Link>

          <Link to="/how-it-works">
            How It Works
          </Link>

          <Link to="/success-stories">
            Stories
          </Link>

          <Link to="/support">
            Support
          </Link>

        </nav>

        <div className="nav-buttons">

          <button
            className="login-btn"
            onClick={() => navigate("/signin")}
          >
            Login
          </button>

          <button
            className="signup-btn"
            onClick={() => navigate("/signup-verify")}
          >
            Sign Up
          </button>

          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            {mobileMenu ? <FiX /> : <FiMenu />}
          </button>

        </div>

      </header>

      {/* ================= PAGE ================= */}

      <div className="how-page">

        {/* HERO */}

        <section className="how-hero">

          <div className="hero-badge">
            Trusted Nationwide Recovery System
          </div>

          <h1>

            How Lost & Found NG

            <span>
              Works
            </span>

          </h1>

          <p>
            Recover lost items faster using secure technology,
            smart matching, and trusted community reporting
            across Nigeria.
          </p>

          <div className="hero-buttons">

            <button
              className="primary-btn"
              onClick={() => navigate("/create-report")}
            >

              Report An Item

              <FiArrowRight />

            </button>

            <button
              className="secondary-btn"
              onClick={() => navigate("/browse")}
            >
              Browse Reports
            </button>

          </div>

        </section>

        {/* STEPS */}

        <section className="steps-section">

          <div className="section-top">

            <h2>
              4 Easy Steps
            </h2>

            <p>
              The recovery process is simple, secure,
              and designed for everyone.
            </p>

          </div>

          <div className="steps-grid">

            {
              steps.map((step) => (

                <div
                  className="step-card"
                  key={step.id}
                >

                  <div className="step-number">
                    {step.id}
                  </div>

                  <div className="step-icon">
                    {step.icon}
                  </div>

                  <h3>
                    {step.title}
                  </h3>

                  <p>
                    {step.text}
                  </p>

                </div>

              ))
            }

          </div>

        </section>

        {/* MATCHING */}

        <section className="matching-section">

          <div className="matching-left">

            <div className="mini-pill">
              AI Powered Matching
            </div>

            <h2>
              Smart Technology
              Helping Nigerians Recover Faster
            </h2>

            <p>
              Our intelligent matching engine compares
              descriptions, locations, categories, photos,
              and timestamps to discover highly accurate matches.
            </p>

            <div className="matching-features">

              <div>

                <FiCheckCircle />

                <span>
                  Real-time report scanning
                </span>

              </div>

              <div>

                <FiCheckCircle />

                <span>
                  AI similarity detection
                </span>

              </div>

              <div>

                <FiCheckCircle />

                <span>
                  Secure ownership verification
                </span>

              </div>

            </div>

          </div>

          <div className="matching-right">

            <div className="matching-card">

              <div className="matching-top">

                <div>

                  <h4>
                    Match Detected
                  </h4>

                  <span>
                    96% Confidence
                  </span>

                </div>

                <FiCheckCircle />

              </div>

              <div className="matching-item">

                <img
                  src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1200&auto=format&fit=crop"
                  alt=""
                />

                <div>

                  <h5>
                    iPhone 13 Pro Max
                  </h5>

                  <p>
                    Ikeja, Lagos
                  </p>

                </div>

              </div>

              <div className="matching-item">

                <img
                  src="https://images.unsplash.com/photo-1517336714739-489689fd1ca8?q=80&w=1200&auto=format&fit=crop"
                  alt=""
                />

                <div>

                  <h5>
                    MacBook Air
                  </h5>

                  <p>
                    Abuja
                  </p>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* SAFETY */}

        <section className="safety-section">

          <div className="section-top">

            <h2>
              Safety & Verification
            </h2>

            <p>
              Your safety and privacy remain our highest priority.
            </p>

          </div>

          <div className="safety-grid">

            {
              safety.map((item, index) => (

                <div
                  className="safety-card"
                  key={index}
                >

                  <div className="safety-icon">
                    {item.icon}
                  </div>

                  <h3>
                    {item.title}
                  </h3>

                  <p>
                    {item.text}
                  </p>

                </div>

              ))
            }

          </div>

        </section>

        {/* COVERAGE */}

        <section className="coverage-section">

          <div className="coverage-card">

            <div className="coverage-left">

              <h2>
                Nationwide Coverage
              </h2>

              <p>
                From Lagos to Kano, Abuja to Port Harcourt,
                Lost & Found NG connects communities across
                all 36 states in Nigeria.
              </p>

              <button
                onClick={() => navigate("/browse")}
              >

                Explore Reports

                <FiArrowRight />

              </button>

            </div>

            <div className="coverage-right">

              <div className="coverage-mini">

                <FiMapPin />

                <div>

                  <h3>
                    36 States
                  </h3>

                  <span>
                    Active Coverage
                  </span>

                </div>

              </div>

              <div className="coverage-mini">

                <FiShield />

                <div>

                  <h3>
                    120K+
                  </h3>

                  <span>
                    Trusted Members
                  </span>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* CTA */}

        <section className="bottom-cta">

          <h2>
            Ready To Recover Your Item?
          </h2>

          <p>
            Join thousands of Nigerians already using
            Lost & Found NG every day.
          </p>

          <div className="bottom-buttons">

            <button
              onClick={() => navigate("/signup-verify")}
            >
              Create Free Account
            </button>

            <button
              className="outline-btn"
              onClick={() => navigate("/create-report")}
            >
              Report Now
            </button>

          </div>

        </section>

      </div>

      <Footer />

    </>

  )

}

export default HowItWorks