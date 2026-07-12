import {
  FiSearch,
  FiArrowRight,
  FiMapPin,
  FiCheckCircle,
  FiFilter,
  FiShield,
  FiMenu,
  FiX,
} from "react-icons/fi"

import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"

import Footer from "../components/Footer"

import "../styles/success-stories.css"

function SuccessStories() {

  const navigate = useNavigate()

  const [mobileMenu, setMobileMenu] = useState(false)

  const [activeFilter, setActiveFilter] = useState("All")

  const [searchText, setSearchText] = useState("")

  const [visibleStories, setVisibleStories] = useState(6)

  const stories = [

    {
      id: 1,
      category: "Documents",
      reward: "Reward: ₦15,000",
      image:
        "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?q=80&w=1200&auto=format&fit=crop",
      user: "Chidi Okonkwo",
      role: "Recovered Owner",
      time: "2 days ago",
      description:
        "I thought my international passport was gone forever. It was found at the airport and returned within 24 hours. The matching system is truly world-class!",
      recovered: "Recovered: International Passport",
      location: "Ikeja, Lagos",
    },

    {
      id: 2,
      category: "Electronics",
      reward: "Reward: ₦50,000",
      image:
        "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?q=80&w=1200&auto=format&fit=crop",
      user: "Aisha Bello",
      role: "Grateful Finder",
      time: "1 week ago",
      description:
        "Finding a high-end laptop felt like a heavy responsibility. Using this platform made it so easy to verify the rightful owner securely.",
      recovered: "Recovered: MacBook Pro M2",
      location: "Maitama, Abuja",
    },

    {
      id: 3,
      category: "Pets",
      reward: "Reward: ₦0",
      image:
        "https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=1200&auto=format&fit=crop",
      user: "Samuel Edet",
      role: "Pet Owner",
      time: "3 days ago",
      description:
        "Simba went missing during the rain. Within 3 hours of posting, a neighbor two streets away contacted me. We are so happy to have him home!",
      recovered: "Recovered: Golden Retriever (Simba)",
      location: "Surulere, Lagos",
    },

    {
      id: 4,
      category: "Keys",
      reward: "Reward: Gratitude",
      image:
        "https://images.unsplash.com/photo-1582139329536-e7284fece509?q=80&w=1200&auto=format&fit=crop",
      user: "Blessing Udoh",
      role: "Business Owner",
      time: "5 days ago",
      description:
        "My store keys and ledger were lost in a tricycle. The finder refused a reward but the relief of getting them back was priceless.",
      recovered: "Recovered: Store Master Keys",
      location: "Uyo, Akwa Ibom",
    },

    {
      id: 5,
      category: "Wallets",
      reward: "Reward: ₦5,000",
      image:
        "https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1200&auto=format&fit=crop",
      user: "Tunde Williams",
      role: "Student",
      time: "1 week ago",
      description:
        "I lost my wallet with my school ID just before exams. A good Samaritan found it and messaged me here. Nigeria still has wonderful people!",
      recovered: "Recovered: Leather Wallet",
      location: "Ibadan, Oyo",
    },

    {
      id: 6,
      category: "Jewelry",
      reward: "Reward: ₦20,000",
      image:
        "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=1200&auto=format&fit=crop",
      user: "Fatima Gumel",
      role: "Professional",
      time: "2 weeks ago",
      description:
        "My wedding ring slipped off while shopping. I was devastated. Someone posted it here as 'Found Jewelry'. The verification process was seamless.",
      recovered: "Recovered: Gold Wedding Band",
      location: "Kano City, Kano",
    },

  ]

  const filters = [
    "All",
    "Electronics",
    "Documents",
    "Pets",
    "Wallets",
    "Jewelry",
    "Others",
  ]

  const filteredStories = stories.filter((story) => {

    const matchesFilter =
      activeFilter === "All"
        ? true
        : story.category === activeFilter

    const matchesSearch =
      story.user.toLowerCase().includes(searchText.toLowerCase()) ||
      story.description.toLowerCase().includes(searchText.toLowerCase()) ||
      story.location.toLowerCase().includes(searchText.toLowerCase()) ||
      story.category.toLowerCase().includes(searchText.toLowerCase())

    return matchesFilter && matchesSearch

  })

  const displayedStories = filteredStories.slice(0, visibleStories)

  const handleLoadMore = () => {
    setVisibleStories((prev) => prev + 3)
  }

  return (

    <>

      {/* ================= HEADER ================= */}

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

      <div className="stories-page">

        {/* HERO */}

        <section className="stories-hero">

          <div className="hero-pill">
            Our Wall of Gratitude
          </div>

          <h1>
            Every Lost Item Has a
            <span>
              Story to Tell.
            </span>
          </h1>

          <p>
            Join thousands of Nigerians who have turned their moments of loss into celebrations of community, honesty, and technology.
          </p>

          <div className="hero-buttons">

            <button
              className="primary-btn"
              onClick={() => navigate("/create-report")}
            >
              Start Your Story
            </button>

            <button
              className="secondary-btn"
              onClick={() => navigate("/how-it-works")}
            >
              Learn How It Works
            </button>

          </div>

        </section>

        {/* STATS */}

        <section className="stories-stats">

          <div className="stat-card">
            <h2>120K+</h2>
            <p>Community Members</p>
          </div>

          <div className="stat-card">
            <h2>15K+</h2>
            <p>Items Recovered</p>
          </div>

          <div className="stat-card">
            <h2>₦12M+</h2>
            <p>Rewards Paid</p>
          </div>

          <div className="stat-card">
            <h2>94%</h2>
            <p>Recovery Rate</p>
          </div>

        </section>

        {/* FILTER */}

        <section className="stories-filter-bar">

          <div className="filter-left">

            {
              filters.map((filter) => (

                <button
                  key={filter}
                  className={
                    activeFilter === filter
                      ? "filter-btn active-filter"
                      : "filter-btn"
                  }
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </button>

              ))
            }

          </div>

          <div className="filter-right">

            <div className="stories-search">

              <FiSearch />

              <input
                type="text"
                placeholder="Search stories..."
                value={searchText}
                onChange={(e) =>
                  setSearchText(e.target.value)
                }
              />

            </div>

            <button className="mini-filter-btn">
              <FiFilter />
            </button>

          </div>

        </section>

        {/* HEADING */}

        <div className="stories-heading-row">

          <div>

            <h2>
              Featured Success Stories
            </h2>

            <p>
              Real stories from verified users across Nigeria
            </p>

          </div>

          <button className="view-all-btn">

            View all stories

            <FiArrowRight />

          </button>

        </div>

        {/* STORIES GRID */}

        <section className="stories-grid">

          {
            displayedStories.map((story) => (

              <div
                className="story-card"
                key={story.id}
              >

                <div className="story-image-wrapper">

                  <img
                    src={story.image}
                    alt=""
                  />

                  <span className="story-category">
                    {story.category}
                  </span>

                  <span className="story-reward">
                    {story.reward}
                  </span>

                </div>

                <div className="story-content">

                  <div className="story-user-row">

                    <img
                      src={`https://i.pravatar.cc/100?img=${story.id + 10}`}
                      alt=""
                      className="story-avatar"
                    />

                    <div>

                      <h4>
                        {story.user}
                      </h4>

                      <span>
                        {story.role} • {story.time}
                      </span>

                    </div>

                  </div>

                  <p className="story-description">
                    "{story.description}"
                  </p>

                  <div className="story-recovered-box">

                    <FiCheckCircle />

                    {story.recovered}

                  </div>

                  <div className="story-location">

                    <FiMapPin />

                    {story.location}

                  </div>

                  <div className="story-footer">

                    <button
                      onClick={() =>
                        navigate(`/success-stories/${story.id}`)
                      }
                    >

                      Read Full Story

                      <FiArrowRight />

                    </button>

                    <span>
                      VERIFIED
                    </span>

                  </div>

                </div>

              </div>

            ))
          }

        </section>

        {/* EMPTY STATE */}

        {
          filteredStories.length === 0 && (

            <div className="empty-state">

              <h3>
                No stories found
              </h3>

              <p>
                Try another search keyword or filter.
              </p>

            </div>

          )
        }

        {/* LOAD MORE */}

        {
          visibleStories < filteredStories.length && (

            <div className="load-more-wrapper">

              <button
                className="load-more-btn"
                onClick={handleLoadMore}
              >
                Load More Stories
              </button>

            </div>

          )
        }

        {/* CTA */}

        <section className="stories-bottom-cta">

          <div className="bottom-cta-content">

            <h2>
              Have you recovered an item using our platform?
            </h2>

            <p>
              Your story could inspire others and help us build a more trustful Nigeria. Share your experience and help others find hope in their moments of loss.
            </p>

            <div className="bottom-cta-buttons">

              <button
                className="orange-btn"
                onClick={() => navigate("/create-report")}
              >
                Share Your Success Story
              </button>

              <button
                className="white-link"
                onClick={() => navigate("/contact")}
              >
                Contact Support
              </button>

            </div>

          </div>

        </section>

      </div>

      <Footer />

    </>

  )

}

export default SuccessStories