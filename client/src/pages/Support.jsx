import {
  FiHelpCircle, FiSearch, FiMail, FiPhone,
  FiMessageCircle, FiChevronDown, FiChevronUp,
  FiShield, FiArrowRight,
} from "react-icons/fi"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import MainLayout from "../layouts/MainLayout"
import DashboardLayout from "../layouts/DashboardLayout"
import { sendSupportMessage } from "../services/supportService"
import * as alert from "../utils/alert"

const FAQS = [
  {
    q: "How does the matching system work?",
    a: "Our AI compares lost and found reports based on category, location, description keywords, image tags, date, and item details. Reports scoring 50% or above are automatically matched and both users are notified.",
  },
  {
    q: "Is my personal information safe?",
    a: "Yes. Contact details are hidden behind our Privacy Reveal system. Both users must agree before any contact information is shared. All conversations are encrypted.",
  },
  {
    q: "What should I do when I find a match?",
    a: "Go to your Matches page, review the evidence comparison, and click Accept Match. You can then start a conversation with the other party to arrange the return of the item.",
  },
  {
    q: "How do I report a fraudulent listing?",
    a: "Open the report details page and click the Report Fraud button. Our moderation team reviews all flags within 24 hours. Never send money to anyone before physically verifying the item.",
  },
  {
    q: "Can I edit my report after submitting?",
    a: "Yes. Go to My Reports, click the edit button on any report, and update the details. Better descriptions and photos improve your match chances.",
  },
  {
    q: "How long does recovery usually take?",
    a: "Most recoveries happen within 1 to 7 days when both parties are active on the platform. Adding clear images and detailed descriptions speeds up the matching process significantly.",
  },
  {
    q: "What are the rewards and how do they work?",
    a: "Rewards are optional amounts set by the person who lost the item. They are handled directly between the two parties. We recommend using our Escrow feature for secure reward transfers.",
  },
  {
    q: "I verified my email but still can't log in — what do I do?",
    a: "Try the Forgot Password flow to reset your credentials. If the problem persists, contact us at support@lostfoundng.com with your registered email address.",
  },
]

const ISSUE_TYPES = {
  account: "Account & Login",
  report: "Report Issue",
  match: "Match Problem",
  payment: "Payment / Reward",
  fraud: "Fraud / Safety",
  other: "Other",
}

const CATEGORIES = [
  { icon: "📱", label: "Account & Login", topics: ["Password reset", "Email verification", "Profile update"] },
  { icon: "📋", label: "Reports", topics: ["Creating a report", "Editing a report", "Deleting a report"] },
  { icon: "🔍", label: "Matches", topics: ["How matching works", "Accepting a match", "Rejecting a match"] },
  { icon: "💬", label: "Messages & Privacy", topics: ["Privacy reveal", "Blocked conversations", "Reporting a user"] },
  { icon: "🛡️", label: "Safety & Fraud", topics: ["Reporting fraud", "Meeting safely", "Escrow payments"] },
  { icon: "🔔", label: "Notifications", topics: ["Not receiving alerts", "Email settings", "Push notifications"] },
]

export default function Support() {

  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [openFaq, setOpenFaq] = useState(null)
  const [formName, setFormName] = useState("")
  const [formEmail, setFormEmail] = useState("")
  const [formIssue, setFormIssue] = useState("")
  const [formMsg, setFormMsg] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)

  const filteredFaqs = FAQS.filter(
    (f) =>
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase())
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formName || !formEmail || !formMsg) return

    setSending(true)
    try {
      await sendSupportMessage({
        name: formName,
        email: formEmail,
        subject: ISSUE_TYPES[formIssue] || "General Inquiry",
        message: formMsg,
      })
      setSubmitted(true)
    } catch (err) {
      alert.error(err.response?.data?.message || "Failed to send your message. Please try again.")
    } finally {
      setSending(false)
    }
  }

  return (
    <MainLayout>
      <DashboardLayout>
        <div style={{ padding: "28px", background: "#f8fafc", minHeight: "100vh" }}>

          {/* HEADER */}
          <div style={{ marginBottom: "32px" }}>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#111827" }}>
              Help &amp; Support
            </h1>
            <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "6px" }}>
              Find answers to common questions or get in touch with our team.
            </p>
          </div>

          {/* SEARCH */}
          <div style={{
            background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
            borderRadius: "20px",
            padding: "40px 32px",
            marginBottom: "32px",
            textAlign: "center",
          }}>
            <FiHelpCircle size={40} color="#fff" style={{ marginBottom: "16px" }} />
            <h2 style={{ color: "#fff", fontSize: "22px", fontWeight: 800, marginBottom: "8px" }}>
              How can we help you?
            </h2>
            <p style={{ color: "#bfdbfe", fontSize: "14px", marginBottom: "24px" }}>
              Search our knowledge base or browse categories below
            </p>
            <div style={{
              display: "flex", gap: "10px",
              background: "#fff", borderRadius: "14px",
              padding: "10px 16px", maxWidth: "480px", margin: "0 auto",
            }}>
              <FiSearch size={18} style={{ color: "#9ca3af", flexShrink: 0, marginTop: 2 }} />
              <input
                type="text"
                placeholder="Search for help..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  flex: 1, border: "none", outline: "none",
                  fontSize: "15px", color: "#111827",
                }}
              />
            </div>
          </div>

          {/* CATEGORIES */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "16px",
            marginBottom: "40px",
          }}>
            {CATEGORIES.map((cat) => (
              <div
                key={cat.label}
                style={{
                  background: "#fff",
                  borderRadius: "16px",
                  border: "1.5px solid #f3f4f6",
                  padding: "20px",
                  cursor: "pointer",
                  transition: "0.2s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = "#bfdbfe"}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = "#f3f4f6"}
              >
                <div style={{ fontSize: "28px", marginBottom: "10px" }}>{cat.icon}</div>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#111827", marginBottom: "10px" }}>
                  {cat.label}
                </h3>
                {cat.topics.map((t) => (
                  <div
                    key={t}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "6px 0", borderBottom: "1px solid #f9fafb",
                      fontSize: "13px", color: "#6b7280", cursor: "pointer",
                    }}
                    onClick={() => setSearch(t)}
                  >
                    {t} <FiArrowRight size={12} />
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div style={{
            background: "#fff",
            borderRadius: "20px",
            border: "1.5px solid #f3f4f6",
            padding: "28px",
            marginBottom: "32px",
          }}>
            <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#111827", marginBottom: "20px" }}>
              Frequently Asked Questions
            </h2>

            {filteredFaqs.length === 0 ? (
              <p style={{ textAlign: "center", color: "#9ca3af", padding: "32px" }}>
                No FAQs match your search. Try different keywords.
              </p>
            ) : (
              filteredFaqs.map((faq, i) => (
                <div
                  key={i}
                  style={{
                    borderBottom: i < filteredFaqs.length - 1 ? "1.5px solid #f3f4f6" : "none",
                    padding: "16px 0",
                  }}
                >
                  <div
                    style={{
                      display: "flex", alignItems: "center",
                      justifyContent: "space-between", cursor: "pointer",
                    }}
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#111827", paddingRight: "16px" }}>
                      {faq.q}
                    </h4>
                    {openFaq === i
                      ? <FiChevronUp size={18} style={{ color: "#2563eb", flexShrink: 0 }} />
                      : <FiChevronDown size={18} style={{ color: "#9ca3af", flexShrink: 0 }} />
                    }
                  </div>
                  {openFaq === i && (
                    <p style={{
                      marginTop: "10px", fontSize: "14px",
                      color: "#6b7280", lineHeight: 1.7,
                    }}>
                      {faq.a}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>

          {/* CONTACT FORM */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
            marginBottom: "32px",
          }}>

            {/* Contact info */}
            <div style={{
              background: "#fff",
              borderRadius: "20px",
              border: "1.5px solid #f3f4f6",
              padding: "28px",
            }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#111827", marginBottom: "20px" }}>
                Contact Us
              </h2>

              {[
                { icon: <FiMail size={18} />, label: "Email Support", value: "support@lostfoundng.com", color: "#2563eb" },
                { icon: <FiPhone size={18} />, label: "Phone", value: "+234 800 LOST FOUND", color: "#16a34a" },
                { icon: <FiMessageCircle size={18} />, label: "Live Chat", value: "Available 8am – 10pm WAT", color: "#7c3aed" },
                { icon: <FiShield size={18} />, label: "Report Fraud", value: "fraud@lostfoundng.com", color: "#dc2626" },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: "flex", alignItems: "flex-start",
                    gap: "14px", marginBottom: "20px",
                  }}
                >
                  <div style={{
                    width: 44, height: 44,
                    borderRadius: "12px",
                    background: item.color + "15",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: item.color, flexShrink: 0,
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#9ca3af", marginBottom: "2px" }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>
                      {item.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact form */}
            <div style={{
              background: "#fff",
              borderRadius: "20px",
              border: "1.5px solid #f3f4f6",
              padding: "28px",
            }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#111827", marginBottom: "20px" }}>
                Send a Message
              </h2>

              {submitted ? (
                <div style={{ textAlign: "center", padding: "32px 0" }}>
                  <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
                  <h3 style={{ fontWeight: 700, color: "#111827" }}>Message Sent!</h3>
                  <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "8px" }}>
                    We will get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setFormName(""); setFormEmail(""); setFormMsg(""); setFormIssue("") }}
                    style={{
                      marginTop: "20px", padding: "10px 24px",
                      background: "#2563eb", color: "#fff",
                      border: "none", borderRadius: "10px",
                      fontWeight: 700, cursor: "pointer",
                    }}
                  >
                    Send Another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

                  {[
                    { label: "Your Name", value: formName, set: setFormName, type: "text", placeholder: "John Adeyemi" },
                    { label: "Email", value: formEmail, set: setFormEmail, type: "email", placeholder: "you@example.com" },
                  ].map((field) => (
                    <div key={field.label}>
                      <label style={{ fontSize: "12px", fontWeight: 700, color: "#374151", display: "block", marginBottom: "6px" }}>
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        value={field.value}
                        onChange={(e) => field.set(e.target.value)}
                        required
                        style={{
                          width: "100%", padding: "10px 14px",
                          border: "1.5px solid #e5e7eb", borderRadius: "10px",
                          fontSize: "14px", color: "#111827",
                          outline: "none", boxSizing: "border-box",
                        }}
                      />
                    </div>
                  ))}

                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 700, color: "#374151", display: "block", marginBottom: "6px" }}>
                      Issue Type
                    </label>
                    <select
                      value={formIssue}
                      onChange={(e) => setFormIssue(e.target.value)}
                      style={{
                        width: "100%", padding: "10px 14px",
                        border: "1.5px solid #e5e7eb", borderRadius: "10px",
                        fontSize: "14px", color: "#111827",
                        background: "#fff", boxSizing: "border-box",
                      }}
                    >
                      <option value="">Select issue type</option>
                      <option value="account">Account &amp; Login</option>
                      <option value="report">Report Issue</option>
                      <option value="match">Match Problem</option>
                      <option value="payment">Payment / Reward</option>
                      <option value="fraud">Fraud / Safety</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 700, color: "#374151", display: "block", marginBottom: "6px" }}>
                      Message
                    </label>
                    <textarea
                      placeholder="Describe your issue in detail..."
                      value={formMsg}
                      onChange={(e) => setFormMsg(e.target.value)}
                      required
                      rows={4}
                      style={{
                        width: "100%", padding: "10px 14px",
                        border: "1.5px solid #e5e7eb", borderRadius: "10px",
                        fontSize: "14px", color: "#111827",
                        outline: "none", resize: "vertical",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    style={{
                      padding: "12px",
                      background: sending ? "#93c5fd" : "#2563eb", color: "#fff",
                      border: "none", borderRadius: "12px",
                      fontSize: "14px", fontWeight: 700,
                      cursor: sending ? "not-allowed" : "pointer", transition: "0.2s",
                    }}
                  >
                    {sending ? "Sending..." : "Send Message"}
                  </button>

                </form>
              )}
            </div>

          </div>

          {/* BOTTOM CTA */}
          <div style={{
            background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
            border: "1.5px solid #bbf7d0",
            borderRadius: "20px",
            padding: "28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "20px",
          }}>
            <div>
              <h3 style={{ fontWeight: 800, color: "#111827", marginBottom: "6px" }}>
                Can't find what you need?
              </h3>
              <p style={{ fontSize: "14px", color: "#6b7280" }}>
                Browse all our help articles or join our community forum.
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
              <button
                onClick={() => navigate("/discover")}
                style={{
                  padding: "10px 20px",
                  border: "1.5px solid #16a34a", borderRadius: "10px",
                  background: "#fff", color: "#16a34a",
                  fontWeight: 700, fontSize: "13px", cursor: "pointer",
                }}
              >
                Browse Reports
              </button>
              <button
                onClick={() => navigate("/create-report")}
                style={{
                  padding: "10px 20px",
                  border: "none", borderRadius: "10px",
                  background: "#16a34a", color: "#fff",
                  fontWeight: 700, fontSize: "13px", cursor: "pointer",
                }}
              >
                Create Report
              </button>
            </div>
          </div>

        </div>
      </DashboardLayout>
    </MainLayout>
  )
}