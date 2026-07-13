import {
  FiSearch,
  FiShield,
  FiMapPin,
  FiHeart,
  FiArrowRight,
  FiClock,
  FiMessageCircle,
  FiCheckCircle,
  FiCamera,
  FiKey,
  FiMenu,
  FiX,
} from "react-icons/fi"

import { useNavigate } from "react-router-dom"
import { useState, useMemo } from "react"

import Footer from "../components/Footer"

import "../styles/home.css"

function Home() {

  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState("all")

  const [searchText, setSearchText] = useState("")

  const [location, setLocation] = useState("")

  const [category, setCategory] = useState("")

  const [mobileMenu, setMobileMenu] = useState(false)

  const [likedStories, setLikedStories] = useState([])

  const reports = [
    {
      id: 1,
      type: "lost",
      title: "iPhone 13 Pro Max",
      image:
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1200&auto=format&fit=crop",
      category: "Electronics",
      time: "2 hours ago",
      location: "Ikeja City Mall, Lagos",
      reward: "₦50,000 Reward",
      views: 140,
    },

    {
      id: 2,
      type: "found",
      title: "Brown Leather Wallet",
      image:
        "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1200&auto=format&fit=crop",
      category: "Personal Effects",
      time: "5 hours ago",
      location: "Wuse 2, Abuja",
      reward: "",
      views: 74,
    },

    {
      id: 3,
      type: "lost",
      title: "Toyota Camry Keys",
      image:
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop",
      category: "Keys",
      time: "1 day ago",
      location: "Lekki Phase 1, Lagos",
      reward: "₦100,000 Reward",
      views: 230,
    },

    {
      id: 4,
      type: "found",
      title: "MacBook Air",
      image:
        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1200&auto=format&fit=crop",
      category: "Electronics",
      time: "3 days ago",
      location: "Port Harcourt Airport",
      reward: "",
      views: 110,
    },
  ]

  const stories = [
    {
      id: 1,
      name: "Chidi Okoro",
      title: "Recovered MacBook Pro",
      text:
        "I had lost all hope after leaving my laptop in a Bolt ride. Within 48 hours I got it back.",
      image: "https://i.pravatar.cc/100?img=8",
    },

    {
      id: 2,
      name: "Fatima Ibrahim",
      title: "Found Student ID",
      text:
        "The platform verified the finder quickly and I got my item back safely.",
      image: "https://i.pravatar.cc/100?img=9",
    },

    {
      id: 3,
      name: "Adebayo Tunde",
      title: "Recovered Car Keys",
      text:
        "Simple, efficient and reliable. The matching system worked perfectly.",
      image: "https://i.pravatar.cc/100?img=10",
    },
  ]

  const filteredReports = useMemo(() => {

    return reports.filter((report) => {

      const matchesTab =
        activeTab === "all"
          ? true
          : report.type === activeTab

      const matchesSearch =
        report.title
          .toLowerCase()
          .includes(searchText.toLowerCase())

      const matchesLocation =
        location === ""
          ? true
          : report.location
            .toLowerCase()
            .includes(location.toLowerCase())

      const matchesCategory =
        category === ""
          ? true
          : report.category
            .toLowerCase()
            .includes(category.toLowerCase())

      return (
        matchesTab &&
        matchesSearch &&
        matchesLocation &&
        matchesCategory
      )
    })

  }, [reports, activeTab, searchText, location, category])

  const handleSearch = () => {
    navigate("/browse")
  }

  const handleLikeStory = (id) => {

    if (likedStories.includes(id)) {

      setLikedStories(
        likedStories.filter((item) => item !== id)
      )

    } else {

      setLikedStories([...likedStories, id])

    }

  }

  return (

    <div className="home-page">

      {/* NAVBAR */}

      <nav className="navbar">

        <div
          className="logo-area"
          onClick={() => navigate("/")}
        >

          <div className="logo-box">
            <FiShield />
          </div>

          <h2>
            Lost & Found NG
          </h2>

        </div>

        <div
          className={
            mobileMenu
              ? "nav-links active-nav"
              : "nav-links"
          }
        >

          <button onClick={() => navigate("/")}>
            Home
          </button>

          <button
            onClick={() => navigate("/browse")}
          >
            Browse
          </button>

          <button
            onClick={() => navigate("/how-it-works")}
          >
            How It Works
          </button>

          <button
            onClick={() => navigate("/success-stories")}
          >
            Stories
          </button>

        </div>

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
            onClick={() =>
              setMobileMenu(!mobileMenu)
            }
          >

            {
              mobileMenu
                ? <FiX />
                : <FiMenu />
            }

          </button>

        </div>

      </nav>

      {/* HERO */}

      <section className="hero-section">

        <div className="hero-left">

          <div className="hero-badge">

            <FiShield />

            Nigeria’s #1 Recovery Platform

          </div>

          <h1>

            Lost Something

            <span>
              Important?
            </span>

          </h1>

          <p>
            Connect with a community of millions.
            Report lost items, search findings,
            and get back what belongs to you
            with secure matching.
          </p>

          <div className="hero-actions">

            <button
              className="primary-btn"
              onClick={() => navigate("/create-report")}
            >

              Report Lost Item

              <FiArrowRight />

            </button>

            <button
              className="secondary-btn"
              onClick={() => navigate("/create-report")}
            >
              I Found Something
            </button>

          </div>

          <div className="mini-users">

            <div className="avatars">

              <img
                src="https://i.pravatar.cc/40?img=1"
                alt=""
              />

              <img
                src="https://i.pravatar.cc/40?img=2"
                alt=""
              />

              <img
                src="https://i.pravatar.cc/40?img=3"
                alt=""
              />

              <img
                src="https://i.pravatar.cc/40?img=4"
                alt=""
              />

            </div>

            <span>

              <strong>
                12,000+
              </strong>

              items recovered this month across Lagos.

            </span>

          </div>

        </div>

        <div className="hero-right">

          <div className="hero-ui-card">

            <div className="ui-floating-card top-card">

              <FiCheckCircle />

              Verified Claims

            </div>

            <div className="ui-floating-card middle-card">

              <FiMessageCircle />

              Secure Messaging

            </div>

            <div className="ui-floating-card bottom-card">

              <FiShield />

              Trusted Network

            </div>

            <div className="phone-card">

              <div className="phone-screen">

                <div className="screen-line"></div>

                <div className="screen-line short"></div>

                <div className="screen-box"></div>

                <div className="screen-bottom">

                  <FiKey />

                  Found Keys

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* SEARCH */}

      <section className="search-section">

        <div className="search-card">

          <div className="search-input-group">

            <label>
              What are you looking for?
            </label>

            <div className="search-input">

              <FiSearch />

              <input
                type="text"
                placeholder="E.g. Laptop, ID Card, Wallet"
                value={searchText}
                onChange={(e) =>
                  setSearchText(e.target.value)
                }
              />

            </div>

          </div>

          <div className="search-input-group">

            <label>
              Category
            </label>

            <div className="search-input">

              <input
                type="text"
                placeholder="Electronics"
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
              />

            </div>

          </div>

          <div className="search-input-group">

            <label>
              Location
            </label>

            <div className="search-input">

              <FiMapPin />

              <input
                type="text"
                placeholder="Lagos, Nigeria"
                value={location}
                onChange={(e) =>
                  setLocation(e.target.value)
                }
              />

            </div>

          </div>

          <button
            className="database-btn"
            onClick={handleSearch}
          >
            Search Database
          </button>

        </div>

      </section>

      {/* REPORTS */}

      <section className="reports-section">

        <div className="reports-top">

          <div className="section-header">

            <h2>
              Latest Community Reports
            </h2>

            <p>
              Real-time updates of lost and found
              items in your vicinity.
            </p>

          </div>

          <div className="report-tabs">

            <button
              className={
                activeTab === "all"
                  ? "active-tab"
                  : ""
              }
              onClick={() => setActiveTab("all")}
            >
              All Items
            </button>

            <button
              className={
                activeTab === "lost"
                  ? "active-tab"
                  : ""
              }
              onClick={() => setActiveTab("lost")}
            >
              Lost
            </button>

            <button
              className={
                activeTab === "found"
                  ? "active-tab"
                  : ""
              }
              onClick={() => setActiveTab("found")}
            >
              Found
            </button>

          </div>

        </div>

        <div className="reports-grid">

          {
            filteredReports.length > 0 ? (

              filteredReports.map((report) => (

                <div
                  className="report-card"
                  key={report.id}
                >

                  <div className="report-image">

                    <img
                      src={report.image}
                      alt=""
                    />

                    <span
                      className={
                        report.type === "lost"
                          ? "lost-tag"
                          : "found-tag"
                      }
                    >
                      {report.type}
                    </span>

                    {
                      report.reward && (

                        <span className="reward-tag">
                          {report.reward}
                        </span>

                      )
                    }

                  </div>

                  <div className="report-content">

                    <span className="report-category">
                      {report.category}
                    </span>

                    <h3>
                      {report.title}
                    </h3>

                    <div className="report-meta">

                      <FiClock />

                      <span>
                        {report.time}
                      </span>

                    </div>

                    <div className="report-meta">

                      <FiMapPin />

                      <span>
                        {report.location}
                      </span>

                    </div>

                    <div className="report-bottom-row">

                      <small>
                        {report.views} views
                      </small>

                      <button
                        className="report-link-btn"
                        onClick={() =>
                          navigate(`/reports/${report.id}`)
                        }
                      >

                        View Details

                        <FiArrowRight />

                      </button>

                    </div>

                  </div>

                </div>

              ))

            ) : (

              <div className="empty-reports">

                <h3>
                  No reports found
                </h3>

                <p>
                  Try another search keyword.
                </p>

              </div>

            )
          }

        </div>

        <button
          className="browse-btn"
          onClick={() => navigate("/browse")}
        >

          Browse All Reports

          <FiArrowRight />

        </button>

      </section>

      {/* HOW */}

      <section className="how-section">

        <h2>
          How It Works
        </h2>

        <p>
          Getting your items back is as simple as these four steps.
        </p>

        <div className="how-grid">

          <div className="how-card">

            <div className="how-icon">

              <FiCamera />

              <span>1</span>

            </div>

            <h3>
              Report Item
            </h3>

            <p>
              Submit clear photos and details.
            </p>

          </div>

          <div className="how-card">

            <div className="how-icon">

              <FiShield />

              <span>2</span>

            </div>

            <h3>
              Smart Matching
            </h3>

            <p>
              AI searches thousands of reports.
            </p>

          </div>

          <div className="how-card">

            <div className="how-icon">

              <FiMessageCircle />

              <span>3</span>

            </div>

            <h3>
              Safe Verification
            </h3>

            <p>
              Verify ownership securely.
            </p>

          </div>

          <div className="how-card">

            <div className="how-icon">

              <FiHeart />

              <span>4</span>

            </div>

            <h3>
              Successful Recovery
            </h3>

            <p>
              Meet safely and recover your item.
            </p>

          </div>

        </div>

      </section>

      {/* STORIES */}

      <section className="stories-section">

        <div className="stories-top">

          <div>

            <h2>
              Success Stories
            </h2>

            <p>
              Stories of hope and community.
            </p>

          </div>

          <button
            className="stories-btn"
            onClick={() =>
              navigate("/success-stories")
            }
          >
            Read More Stories
          </button>

        </div>

        <div className="stories-grid">

          {
            stories.map((story) => (

              <div
                className="story-card"
                key={story.id}
              >

                <div className="story-user">

                  <img
                    src={story.image}
                    alt=""
                  />

                  <div>

                    <h4>
                      {story.name}
                    </h4>

                    <span>
                      {story.title}
                    </span>

                  </div>

                </div>

                <p>
                  “{story.text}”
                </p>

                <button
                  className={
                    likedStories.includes(story.id)
                      ? "liked-story-btn"
                      : "story-like-btn"
                  }
                  onClick={() =>
                    handleLikeStory(story.id)
                  }
                >

                  <FiHeart />

                  {
                    likedStories.includes(story.id)
                      ? "Liked"
                      : "Like Story"
                  }

                </button>

              </div>

            ))
          }

        </div>

      </section>

      {/* CTA */}

      <section className="cta-section">

        <div className="cta-box">

          <FiHeart className="cta-heart" />

          <h2>
            Ready to Find Your Lost Item?
          </h2>

          <p>
            Join thousands of Nigerians using our
            platform today.
          </p>

          <div className="cta-buttons">

            <button
              onClick={() => navigate("/signup-verify")}
            >
              Create Your Free Account
            </button>

            <button
              onClick={() => navigate("/browse")}
            >
              Browse Public Database
            </button>

          </div>

        </div>

      </section>

      <Footer />

    </div>

  )
}

export default Home