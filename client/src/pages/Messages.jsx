import {
  FiSearch, FiMoreVertical, FiImage, FiSend, FiTrash2,
  FiX, FiPhone, FiVideo, FiSmile, FiEdit2, FiCheck,
  FiShield, FiLock, FiAlertTriangle, FiArrowLeft, FiInfo,
} from "react-icons/fi"
import { useState, useRef, useEffect } from "react"
import { useLocation } from "react-router-dom"
import MainLayout from "../layouts/MainLayout"
import DashboardLayout from "../layouts/DashboardLayout"
import {
  getConversations,
  sendMessage as sendMessageAPI,
  getMessages,
  editMessage as editMessageAPI,
  deleteMessage as deleteMessageAPI,
  requestPrivacyReveal,
  acceptPrivacyReveal,
} from "../services/messageService"
import * as alert from "../utils/alert"
import Swal from "sweetalert2"
import "../styles/messages.css"

const STATUS_COLORS = {
  matched: { bg: "#d1fae5", color: "#065f46" },
  open: { bg: "#dbeafe", color: "#1e40af" },
  closed: { bg: "#f3f4f6", color: "#374151" },
}

// Messages can only be edited or deleted within 15 minutes of sending —
// mirrors the same limit enforced server-side in editMessage.js/deleteMessage.js
const EDIT_DELETE_WINDOW_MS = 15 * 60 * 1000

function Messages() {

  const chatEndRef = useRef(null)
  const routeLocation = useLocation()

  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"))

  const [conversations, setConversations] = useState([])
  const [activeConv, setActiveConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState("")
  const [search, setSearch] = useState("")
  const [uploadedImage, setUploadedImage] = useState(null)
  const [showProfile, setShowProfile] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [mobileView, setMobileView] = useState("list")
  const [editingMessageId, setEditingMessageId] = useState(null)
  const [editedText, setEditedText] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [revealRequested, setRevealRequested] = useState(false)
  const [accessRequested, setAccessRequested] = useState(false)

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await getConversations()
        const list = data.conversations || []
        setConversations(list)

        const stateConvId = routeLocation.state?.conversationId
        if (stateConvId) {
          const target = list.find((c) => String(c._id) === String(stateConvId))
          if (target) { setActiveConv(target); setMobileView("chat") }
        } else if (list.length > 0) {
          setActiveConv(list[0])
        }
      } catch (err) {
        console.error("Failed to load conversations:", err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchConversations()
  }, [])

  useEffect(() => {
    if (!activeConv) return
    const fetchMessages = async () => {
      try {
        const data = await getMessages(activeConv._id)
        setMessages(data.messages || [])
      } catch (err) {
        console.error("Failed to load messages:", err.message)
      }
    }
    fetchMessages()
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [activeConv?._id])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length])

  useEffect(() => {
    if (!showMenu) return
    const h = () => setShowMenu(false)
    document.addEventListener("click", h)
    return () => document.removeEventListener("click", h)
  }, [showMenu])

  const getOtherParticipant = (conv) => {
    if (!conv?.participants) return null
    return conv.participants.find(
      (p) => String(p._id) !== String(loggedInUser?._id)
    )
  }

  const handleSendMessage = async () => {
    if (!message.trim() && !uploadedImage) return
    if (!activeConv) return
    setSending(true)
    try {
      let body
      if (uploadedImage) {
        body = new FormData()
        body.append("text", message.trim())
        body.append("attachments", uploadedImage)
      } else {
        body = { text: message.trim() }
      }

      const data = await sendMessageAPI(activeConv._id, body)

      setMessages((prev) => [...prev, data.data])
      setConversations((prev) =>
        prev.map((c) =>
          String(c._id) === String(activeConv._id)
            ? { ...c, lastMessage: data.data }
            : c
        )
      )
      setMessage("")
      setUploadedImage(null)
    } catch (err) {
      alert.error(err.message || "Failed to send message.", "Error")
    } finally {
      setSending(false)
    }
  }

  const handleEditMessage = async (messageId) => {
    if (!editedText.trim()) return
    try {
      const data = await editMessageAPI(messageId, editedText)
      setMessages((prev) =>
        prev.map((m) =>
          String(m._id) === String(messageId) ? data.data : m
        )
      )
      setEditingMessageId(null)
      setEditedText("")
    } catch (err) {
      alert.error(err.message || "Failed to edit message.", "Error")
    }
  }

  const handleDeleteMessage = async (messageId) => {
    const confirmed = await alert.confirm("Delete this message for everyone?", "Delete Message")
    if (!confirmed) return
    try {
      await deleteMessageAPI(messageId)
      setMessages((prev) =>
        prev.filter((m) => String(m._id) !== String(messageId))
      )
    } catch (err) {
      alert.error(err.message || "Failed to delete message.", "Error")
    }
  }

  const handleRequestReveal = async () => {
    if (!activeConv) return
    alert.loading("Requesting privacy reveal...")
    try {
      await requestPrivacyReveal(activeConv._id)
      Swal.close()
      setRevealRequested(true)
      alert.toast("Privacy reveal requested!", "success")
    } catch (err) {
      Swal.close()
      alert.error(err.message || "Failed to request reveal.", "Error")
    }
  }

  const handleAcceptReveal = async () => {
    if (!activeConv) return
    alert.loading("Accepting privacy reveal...")
    try {
      await acceptPrivacyReveal(activeConv._id)
      Swal.close()
      setAccessRequested(true)
      alert.toast("Privacy revealed! You can now see contact info.", "success")
    } catch (err) {
      Swal.close()
      alert.error(err.message || "Failed to accept reveal.", "Error")
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) setUploadedImage(file)
  }

  const filteredConversations = conversations.filter((c) => {
    const other = getOtherParticipant(c)
    return other?.name?.toLowerCase().includes(search.toLowerCase())
  })

  const activeReport = activeConv?.reportId
  const panelStatus = activeReport?.status || "open"
  const statusStyle = STATUS_COLORS[panelStatus] || STATUS_COLORS["open"]
  const otherUser = activeConv ? getOtherParticipant(activeConv) : null

  return (
    <MainLayout>
      <DashboardLayout>
        <div className="messages-page">
          <div className="messages-app">

            {/* LEFT — Conversation list */}
            <div className={`messages-left ${mobileView !== "list" ? "mobile-hidden" : ""}`}>
              <div className="messages-left-header">
                <h2>Messages</h2>
                <div className="messages-search">
                  <FiSearch />
                  <input
                    type="text"
                    placeholder="Search chats..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="chat-users">

                {loading && (
                  <p style={{ padding: "20px", color: "#9ca3af", textAlign: "center" }}>
                    Loading conversations...
                  </p>
                )}

                {!loading && filteredConversations.length === 0 && (
                  <p style={{ padding: "20px", color: "#9ca3af", textAlign: "center" }}>
                    No conversations yet.
                    <br />Accept a match to start chatting.
                  </p>
                )}

                {filteredConversations.map((conv) => {
                  const other = getOtherParticipant(conv)
                  const lastMsg = conv.lastMessage
                  const isActive = String(activeConv?._id) === String(conv._id)

                  return (
                    <div
                      key={conv._id}
                      className={`chat-user ${isActive ? "active-chat" : ""}`}
                      onClick={() => { setActiveConv(conv); setMobileView("chat") }}
                    >
                      <div className="chat-user-image">
                        {other?.avatar
                          ? <img src={other.avatar} alt="" />
                          : <div className="chat-avatar-fallback">{other?.name?.charAt(0) || "?"}</div>
                        }
                        <span />
                      </div>
                      <div className="chat-user-content">
                        <h4>{other?.name || "Unknown User"}</h4>
                        <p>{lastMsg?.text || "Start chatting..."}</p>
                        {conv.reportId && (
                          <span className="chat-tag">
                            🏷 {conv.reportId.title}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}

              </div>
            </div>

            {/* CENTER — Active chat */}
            {activeConv ? (
              <div className={`messages-center ${mobileView !== "chat" ? "mobile-hidden" : ""}`}>

                <div className="privacy-banner">
                  <div className="privacy-left">
                    <div className="privacy-icon"><FiShield /></div>
                    <div>
                      <h3>Privacy Protected</h3>
                      <p>Protect your identity until trust is established.</p>
                    </div>
                  </div>
                  <button
                    className={`reveal-btn ${revealRequested ? "reveal-done" : ""}`}
                    onClick={handleRequestReveal}
                    disabled={revealRequested}
                  >
                    {revealRequested ? "✓ Requested" : "Request Reveal"}
                  </button>
                </div>

                <div className="chat-header">
                  <div className="chat-header-user">
                    <button className="chat-back-btn" onClick={() => setMobileView("list")}>
                      <FiArrowLeft />
                    </button>
                    {otherUser?.avatar
                      ? <img src={otherUser.avatar} alt="" onClick={() => setShowProfile(true)} style={{ cursor: "pointer" }} />
                      : <div className="chat-avatar-fallback" onClick={() => setShowProfile(true)} style={{ cursor: "pointer" }}>{otherUser?.name?.charAt(0) || "?"}</div>
                    }
                    <div className="chat-header-text">
                      <h3>{otherUser?.name || "Unknown User"}</h3>
                      <p>{activeReport ? `REPORT: ${activeReport.title}` : "Online"}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10, position: "relative" }}>
                    <button className="menu-btn call-btn"><FiPhone /></button>
                    <button className="menu-btn video-btn"><FiVideo /></button>
                    <button className="menu-btn chat-info-btn" onClick={() => setMobileView("info")}><FiInfo /></button>
                    <button className="menu-btn" onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu) }}>
                      <FiMoreVertical />
                    </button>
                    {showMenu && (
                      <div className="dropdown-menu">
                        <button onClick={() => { setShowProfile(true); setShowMenu(false) }}>View Profile</button>
                        <button onClick={() => setShowMenu(false)}>Block User</button>
                        <button onClick={() => setShowMenu(false)} style={{ color: "#ef4444" }}>Report</button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="chat-body">
                  <div className="today">TODAY</div>

                  {messages.map((msg) => {
                    const isMine = String(msg.senderId?._id) === String(loggedInUser?._id)

                    return (
                      <div key={msg._id} className={`message-group ${isMine ? "sent-group" : "received-group"}`}>
                        <div className={`message ${isMine ? "sent" : "received"}`}>

                          {msg.attachments?.length > 0 && (
                            <img src={msg.attachments[0]} alt="" className="chat-image" />
                          )}

                          {editingMessageId === msg._id ? (
                            <div className="edit-message-box">
                              <input
                                type="text"
                                value={editedText}
                                autoFocus
                                onChange={(e) => setEditedText(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleEditMessage(msg._id)}
                              />
                              <button onClick={() => handleEditMessage(msg._id)}><FiCheck /></button>
                            </div>
                          ) : (
                            !msg.deletedForEveryone && msg.text && (
                              <p className="message-text">
                                {msg.text}
                                {msg.isEdited && <span className="edited-tag"> edited</span>}
                              </p>
                            )
                          )}

                          {msg.deletedForEveryone && (
                            <p style={{ color: "#9ca3af", fontStyle: "italic", fontSize: "13px" }}>
                              This message was deleted
                            </p>
                          )}

                          <div className="message-footer">
                            <span className="message-time">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            {isMine && !msg.deletedForEveryone && (Date.now() - new Date(msg.createdAt).getTime() < EDIT_DELETE_WINDOW_MS) && (
                              <div className="message-actions">
                                <button onClick={() => { setEditingMessageId(msg._id); setEditedText(msg.text) }}>
                                  <FiEdit2 />
                                </button>
                                <button onClick={() => handleDeleteMessage(msg._id)}>
                                  <FiTrash2 />
                                </button>
                              </div>
                            )}
                          </div>

                        </div>
                      </div>
                    )
                  })}

                  <div ref={chatEndRef} />
                </div>

                {uploadedImage && (
                  <div className="image-preview-container">
                    <div className="image-preview-card">
                      <img
                        src={URL.createObjectURL(uploadedImage)}
                        alt="preview"
                        className="preview-image"
                      />
                      <button className="remove-preview-btn" onClick={() => setUploadedImage(null)}>
                        <FiX />
                      </button>
                    </div>
                  </div>
                )}

                <div className="encrypted-box">
                  <FiShield />
                  <p>Conversation Encrypted &amp; Monitored</p>
                  <span>Meet in a public place, and never share your address or bank details.</span>
                </div>

                <div className="chat-input">
                  <label className="chat-input-icon-btn">
                    <FiImage />
                    <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                  </label>
                  <FiSmile className="chat-input-icon-btn" />
                  <input
                    type="text"
                    placeholder="Type message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <span className="char-count">{message.length}/1000</span>
                  <button
                    className="send-btn"
                    onClick={handleSendMessage}
                    disabled={(!message.trim() && !uploadedImage) || sending}
                  >
                    <FiSend />
                  </button>
                </div>

              </div>
            ) : (
              <div className="no-chat-selected">
                <FiShield size={48} />
                <h3>Select a conversation</h3>
                <p>Choose a chat from the left to start messaging</p>
              </div>
            )}

            {/* RIGHT — Item info panel */}
            {activeConv && (
              <div className={`messages-right ${mobileView !== "info" ? "mobile-hidden" : ""}`}>
                <div className="info-mobile-header">
                  <button className="chat-back-btn" onClick={() => setMobileView("chat")}>
                    <FiArrowLeft />
                  </button>
                  <h4>Item &amp; Safety Info</h4>
                </div>

                <h5>ABOUT THE ITEM</h5>
                <div className="item-card">
                  {activeReport?.images?.[0]
                    ? <img src={activeReport.images[0]} alt={activeReport.title} style={{ width: "100%", height: 160, objectFit: "cover" }} />
                    : <div className="item-card-placeholder"><FiImage size={36} /></div>
                  }
                  <div className="item-overlay">
                    <h3>{activeReport?.title || "No item linked"}</h3>
                    <p>{activeReport ? `${activeReport.type === "lost" ? "Lost" : "Found"} report` : ""}</p>
                  </div>
                </div>

                <div className="item-stats">
                  <div className="status-box">
                    <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 6 }}>STATUS</p>
                    <h4 style={{ fontSize: 11, fontWeight: 700, color: statusStyle.color, background: statusStyle.bg, display: "inline-block", padding: "3px 10px", borderRadius: 8, textTransform: "uppercase" }}>
                      {panelStatus}
                    </h4>
                  </div>
                  <div className="reward-box">
                    <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 6 }}>REWARD</p>
                    <h4>{activeReport?.reward || "₦0"}</h4>
                  </div>
                </div>

                <h5>CONTACT INFORMATION</h5>
                <div className="contact-box">
                  {activeConv.isPrivacyRevealed ? (
                    <div>
                      <p style={{ fontWeight: 600, marginBottom: 8 }}>{otherUser?.name}</p>
                      <p>{otherUser?.phone || "No phone added"}</p>
                      <p>{otherUser?.email}</p>
                    </div>
                  ) : (
                    <>
                      <FiLock size={36} />
                      <p>Information is hidden for your safety.</p>
                      <button
                        className={accessRequested ? "access-done" : ""}
                        onClick={handleAcceptReveal}
                        disabled={accessRequested}
                      >
                        {accessRequested ? "✓ Access Accepted" : "Accept Reveal Request"}
                      </button>
                    </>
                  )}
                </div>

                <div className="checklist">
                  <h5>SAFETY CHECKLIST</h5>
                  {[
                    "Verify item details with multiple specific questions before meeting.",
                    "Always choose a public, well-lit place for item handover.",
                    "Never share your address, bank, or card details in chat.",
                  ].map((tip, i) => (
                    <div key={i} className="check-item">
                      <div className="check-circle"><FiCheck size={11} /></div>
                      <p>{tip}</p>
                    </div>
                  ))}
                </div>

                <div className="report-alert">
                  <FiAlertTriangle /> Report Suspicious Activity
                </div>

              </div>
            )}

          </div>
        </div>

        {showProfile && otherUser && (
          <div className="profile-overlay" onClick={() => setShowProfile(false)}>
            <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
              {otherUser.avatar
                ? <img src={otherUser.avatar} alt="" className="profile-modal-image" />
                : <div className="chat-avatar-fallback" style={{ width: 80, height: 80, fontSize: 32, margin: "0 auto 16px" }}>{otherUser.name?.charAt(0)}</div>
              }
              <h2>{otherUser.name}</h2>
              <p>{otherUser.email}</p>
              <p>{otherUser.phone || "No phone"}</p>
              <button className="close-profile-btn" onClick={() => setShowProfile(false)}>Close</button>
            </div>
          </div>
        )}

      </DashboardLayout>
    </MainLayout>
  )
}

export default Messages