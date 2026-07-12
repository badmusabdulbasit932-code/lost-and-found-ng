import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  FiUser, FiLock, FiBell, FiShield, FiMoon, FiGlobe,
  FiChevronRight, FiCheckCircle, FiAlertCircle, FiGrid,
  FiEye, FiEyeOff, FiSave, FiTrash2, FiLogOut,
  FiSmartphone, FiMail, FiMapPin, FiPhone, FiSun,
  FiKey, FiDownload, FiInfo,
} from "react-icons/fi"
import { useAuth } from "../context/AuthContext"
import { useNotifications } from "../context/NotificationContext"
import MainLayout from "../layouts/MainLayout"
import DashboardLayout from "../layouts/DashboardLayout"
import "../styles/settings.css"

/* ─── per-user storage ────────────────────────────────────────────────── */
const uKey = (uid, s) => `user_${uid}_${s}`
const LS = {
  get:    (k, fb=null) => { try { const v=localStorage.getItem(k); return v!==null?JSON.parse(v):fb } catch{return fb} },
  set:    (k,v) =>        { try { localStorage.setItem(k,JSON.stringify(v)) } catch{ /* storage unavailable */ } },
  rawGet: k =>              localStorage.getItem(k)||"",
  rawSet: (k,v) =>          localStorage.setItem(k,v),
}

const SECTIONS = [
  { id:"account",       icon:<FiUser/>,     label:"Account"        },
  { id:"security",      icon:<FiLock/>,     label:"Security"       },
  { id:"notifications", icon:<FiBell/>,     label:"Notifications"  },
  { id:"privacy",       icon:<FiShield/>,   label:"Privacy"        },
  { id:"appearance",    icon:<FiMoon/>,     label:"Appearance"     },
  { id:"region",        icon:<FiGlobe/>,    label:"Region"         },
  { id:"data",          icon:<FiDownload/>, label:"Data & Export"  },
]

export default function Setting() {
  const navigate = useNavigate()
  const { user, updateUser, logout } = useAuth()
  const { addNotification }          = useNotifications()

  const uid = user?.id || user?.email || "guest"
  const avatarBase64 = LS.rawGet(uKey(uid,"avatar"))
  const initials = (user?.name||user?.fullName||"?").split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase()

  /* ── section ── */
  const [section, setSection] = useState("account")

  /* ── account form — seeded from AuthContext user ── */
  const [form, setForm] = useState({
    name:     user?.name     || user?.fullName || "",
    email:    user?.email    || "",
    phone:    user?.phone    || "",
    location: user?.location || "",
    username: user?.username || "",
  })
  const handleFormChange = e => setForm(p => ({...p, [e.target.name]: e.target.value}))

  /* ── password ── */
  const [pw,      setPw]      = useState({ current:"", next:"", confirm:"" })
  const [showPw,  setShowPw]  = useState({ current:false, next:false, confirm:false })
  const [pwError, setPwError] = useState("")
  const [pwOk,    setPwOk]    = useState(false)
  const handlePwChange = e => { setPw(p=>({...p,[e.target.name]:e.target.value})); setPwError(""); setPwOk(false) }

  /* ── notifications — per user ── */
  const [notifs, setNotifs] = useState(() => LS.get(uKey(uid,"notifs"),{
    matchEmail:true, matchSms:true, msgEmail:true, msgSms:false, weeklyDigest:true, pushAll:false, fraudAlerts:true,
  }))
  const toggleNotif = key => setNotifs(n => { const u={...n,[key]:!n[key]}; LS.set(uKey(uid,"notifs"),u); return u })

  /* ── privacy — per user ── */
  const [privacy, setPrivacy] = useState(() => LS.get(uKey(uid,"privacy"),{
    showPhone:false, showLocation:true, publicProfile:true, allowMessages:true, showActivity:true,
  }))
  const togglePrivacy = key => setPrivacy(p => { const u={...p,[key]:!p[key]}; LS.set(uKey(uid,"privacy"),u); return u })

  /* ── appearance ── */
  const [theme,    setTheme]    = useState(() => LS.rawGet("theme")    || "light")
  const [fontSize, setFontSize] = useState(() => LS.rawGet("fontSize") || "medium")

  /* ── region — per user ── */
  const [region,   setRegion]   = useState(() => LS.rawGet(uKey(uid,"region"))   || "Nigeria")
  const [currency, setCurrency] = useState(() => LS.rawGet(uKey(uid,"currency")) || "NGN")
  const [language, setLanguage] = useState(() => LS.rawGet(uKey(uid,"language")) || "English")

  /* ── toast ── */
  const [toast, setToast] = useState({ msg:"", type:"success" })
  const showToast = (msg, type="success") => {
    setToast({ msg, type })
    setTimeout(() => setToast({ msg:"", type:"success" }), 3000)
  }

  /* ── not logged in guard — after all hooks so hook order stays stable ── */
  if (!user) {
    return (
      <MainLayout><DashboardLayout>
        <div className="st-not-auth">
          <FiAlertCircle size={40}/>
          <h2>Not logged in</h2>
          <button className="st-btn-primary" onClick={() => navigate("/signin")}>Sign In</button>
        </div>
      </DashboardLayout></MainLayout>
    )
  }

  /* ── pw strength ── */
  const pwScore  = Math.min(3,(pw.next.length>=8?1:0)+(/[A-Z]/.test(pw.next)?1:0)+(/[0-9!@#$%^&*]/.test(pw.next)?1:0))
  const pwColors = ["#dc2626","#f59e0b","#16a34a","#1B3FA0"]
  const pwLabels = ["Weak","Fair","Strong","Very Strong"]

  /* ── save account ── */
  const saveAccount = () => {
    if (!form.name.trim())          { showToast("Full name is required","error"); return }
    if (!form.email.includes("@"))  { showToast("Enter a valid email","error");   return }
    updateUser({ name:form.name, phone:form.phone, location:form.location, username:form.username })
    // also persist extra fields locally so they survive a hard refresh
    LS.set(uKey(uid,"profile"), form)
    showToast("Account settings saved!")
    addNotification("system","Settings Updated","Your account settings were saved.")
  }

  /* ── save password ── */
  const savePassword = () => {
    const stored = LS.rawGet(uKey(uid,"password")) || user?.password || "password"
    if (pw.current !== stored)      { setPwError("Current password is incorrect."); return }
    if (pw.next.length < 8)         { setPwError("New password must be at least 8 characters."); return }
    if (pw.next !== pw.confirm)     { setPwError("Passwords do not match."); return }
    LS.rawSet(uKey(uid,"password"), pw.next)
    updateUser({ password: pw.next })
    setPw({ current:"", next:"", confirm:"" })
    setPwOk(true); setPwError("")
    showToast("Password updated!")
    addNotification("account_verified","Password Changed","Your password was updated successfully.")
  }

  /* ── save appearance ── */
  const saveAppearance = () => {
    LS.rawSet("theme",    theme)
    LS.rawSet("fontSize", fontSize)
    showToast("Appearance settings saved!")
  }

  /* ── save region ── */
  const saveRegion = () => {
    LS.rawSet(uKey(uid,"region"),   region)
    LS.rawSet(uKey(uid,"currency"), currency)
    LS.rawSet(uKey(uid,"language"), language)
    showToast("Region settings saved!")
  }

  /* ── export data ── */
  const exportData = () => {
    const reports = LS.get("reports",[]).filter(r => r.userId===uid||r.userEmail===user.email)
    const blob = new Blob([JSON.stringify({
      user, reports,
      profile:  LS.get(uKey(uid,"profile"),{}),
      notifs,   privacy,
      exportedAt: new Date().toISOString(),
    }, null, 2)], { type:"application/json" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `lostfound_data_${Date.now()}.json`
    a.click()
    showToast("Data exported!")
  }

  /* ── toggle helper ── */
  const Toggle = ({ on, onToggle, label }) => (
    <button className={`st-toggle ${on?"st-toggle--on":""}`} onClick={onToggle} aria-label={label}>
      <div className="st-toggle-knob"/>
    </button>
  )

  /* ─── RENDER ──────────────────────────────────────────────────────────── */
  return (
    <MainLayout>
      <DashboardLayout>
        <div className="st-page">

          {/* Toast */}
          {toast.msg && (
            <div className={`st-toast st-toast--${toast.type}`}>
              {toast.type==="success"?<FiCheckCircle/>:<FiAlertCircle/>} {toast.msg}
            </div>
          )}

          {/* Topbar */}
          <div className="st-topbar">
            <div>
              <h1 className="st-page-title">Settings</h1>
              <p className="st-page-sub">Manage your account preferences and privacy</p>
            </div>
            <button className="st-dashboard-btn" onClick={() => navigate("/dashboard")}>
              <FiGrid/> Dashboard
            </button>
          </div>

          <div className="st-layout">

            {/* ── SIDEBAR NAV ── */}
            <nav className="st-nav">
              {/* user mini-card */}
              <div className="st-user-card">
                <div className="st-user-avatar">
                  {avatarBase64
                    ? <img src={avatarBase64} alt={user.name}/>
                    : <span>{initials}</span>
                  }
                </div>
                <div className="st-user-info">
                  <div className="st-user-name">{user.name||user.fullName||"User"}</div>
                  <div className="st-user-email">{user.email}</div>
                </div>
              </div>

              {SECTIONS.map(s => (
                <button key={s.id}
                  className={`st-nav-item ${section===s.id?"st-nav-item--active":""}`}
                  onClick={() => setSection(s.id)}
                >
                  {s.icon} {s.label}
                  <FiChevronRight size={13} className="st-nav-arrow"/>
                </button>
              ))}

              <div className="st-nav-divider"/>
              <button className="st-nav-item st-nav-item--danger" onClick={() => logout(navigate)}>
                <FiLogOut/> Sign Out
              </button>
            </nav>

            {/* ── CONTENT ── */}
            <div className="st-content">

              {/* ══ ACCOUNT ══ */}
              {section==="account" && (
                <div className="st-section">
                  <div className="st-section-head">
                    <h2 className="st-section-title"><FiUser size={16}/> Account Information</h2>
                    <p className="st-section-sub">Update your personal details.</p>
                  </div>
                  <div className="st-card">
                    <div className="st-form-grid">
                      {[
                        { label:"Full Name",  name:"name",     type:"text",  icon:<FiUser size={13}/>,    placeholder:"Your full name"   },
                        { label:"Username",   name:"username", type:"text",  icon:<FiUser size={13}/>,    placeholder:"e.g. basit_ng"    },
                        { label:"Email",      name:"email",    type:"email", icon:<FiMail size={13}/>,    placeholder:"you@example.com", readOnly:true },
                        { label:"Phone",      name:"phone",    type:"tel",   icon:<FiPhone size={13}/>,   placeholder:"+234 …"           },
                        { label:"Location",   name:"location", type:"text",  icon:<FiMapPin size={13}/>,  placeholder:"City, State"      },
                      ].map(f => (
                        <div key={f.name} className="st-form-group">
                          <label className="st-label">{f.label}</label>
                          <div className="st-input-wrap">
                            <span className="st-input-icon">{f.icon}</span>
                            <input
                              className={`st-input ${f.readOnly?"st-input--readonly":""}`}
                              type={f.type} name={f.name}
                              value={form[f.name]||""}
                              placeholder={f.placeholder}
                              readOnly={f.readOnly}
                              onChange={handleFormChange}
                            />
                          </div>
                          {f.readOnly && (
                            <p className="st-field-note"><FiInfo size={11}/> Email is your login ID — contact support to change it.</p>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="st-card-footer">
                      <button className="st-btn-primary" onClick={saveAccount}>
                        <FiSave size={14}/> Save Account Details
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ══ SECURITY ══ */}
              {section==="security" && (
                <div className="st-section">
                  <div className="st-section-head">
                    <h2 className="st-section-title"><FiLock size={16}/> Security Settings</h2>
                    <p className="st-section-sub">Keep your account safe with a strong password and verification.</p>
                  </div>

                  {/* Password */}
                  <div className="st-card st-card--mb">
                    <h3 className="st-card-title"><FiKey size={14}/> Change Password</h3>
                    {pwError && <div className="st-alert st-alert--error"><FiAlertCircle size={13}/> {pwError}</div>}
                    {pwOk    && <div className="st-alert st-alert--success"><FiCheckCircle size={13}/> Password changed!</div>}
                    {["current","next","confirm"].map((field,i) => (
                      <div key={field} className="st-form-group">
                        <label className="st-label">{["Current Password","New Password","Confirm New Password"][i]}</label>
                        <div className="st-pw-wrap">
                          <input className="st-input" name={field}
                            type={showPw[field]?"text":"password"}
                            value={pw[field]} placeholder="••••••••"
                            onChange={handlePwChange} autoComplete="new-password"/>
                          <button className="st-pw-eye" type="button"
                            onClick={() => setShowPw(p=>({...p,[field]:!p[field]}))}>
                            {showPw[field]?<FiEyeOff size={14}/>:<FiEye size={14}/>}
                          </button>
                        </div>
                      </div>
                    ))}
                    {pw.next && (
                      <div className="st-pw-strength">
                        {[0,1,2,3].map(i => (
                          <div key={i} className="st-pw-bar"
                            style={{background: i<=pwScore ? pwColors[pwScore] : "var(--gray-200)"}}/>
                        ))}
                        <span className="st-pw-label" style={{color:pwColors[pwScore]}}>{pwLabels[pwScore]}</span>
                      </div>
                    )}
                    <button className="st-btn-primary" onClick={savePassword}>
                      <FiLock size={14}/> Update Password
                    </button>
                  </div>

                  {/* Verification */}
                  <div className="st-card st-card--mb">
                    <h3 className="st-card-title"><FiShield size={14}/> Verification Status</h3>
                    {[
                      { label:"Email Address",        ok:true,          status:"Verified",    action:null          },
                      { label:"Phone Number",          ok:!!user.phone,  status:user.phone?"Verified":"Not Verified", action:!user.phone?"Verify Now":null },
                      { label:"NIN / Identity",        ok:true,          status:"Verified",    action:null          },
                      { label:"Two-Factor Auth (2FA)", ok:false,         status:"Not Enabled", action:"Enable 2FA"  },
                      { label:"BVN Verification",      ok:false,         status:"Not Linked",  action:"Link BVN"    },
                    ].map(row => (
                      <div key={row.label} className="st-verif-row">
                        <div className="st-verif-left">
                          <span className={`st-verif-dot ${row.ok?"ok":"warn"}`}/>
                          <span className="st-verif-label">{row.label}</span>
                        </div>
                        <div className="st-verif-right">
                          <span className={`st-verif-status ${row.ok?"ok":"warn"}`}>
                            {row.ok?<><FiCheckCircle size={11}/> {row.status}</>:<><FiAlertCircle size={11}/> {row.status}</>}
                          </span>
                          {row.action && (
                            <button className="st-verif-action" onClick={() => showToast(`${row.action} — coming soon`)}>
                              {row.action}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Danger zone */}
                  <div className="st-card st-card--danger">
                    <h3 className="st-card-title" style={{color:"var(--red)"}}>
                      <FiAlertCircle size={14}/> Danger Zone
                    </h3>
                    <p className="st-danger-desc">These actions are permanent and cannot be undone.</p>
                    <div className="st-danger-actions">
                      <div className="st-danger-row">
                        <div>
                          <div className="st-danger-label">Deactivate Account</div>
                          <div className="st-danger-sub">Temporarily hide your profile and reports.</div>
                        </div>
                        <button className="st-btn-warn" onClick={() => showToast("Deactivation request sent to support")}>
                          Deactivate
                        </button>
                      </div>
                      <div className="st-danger-row">
                        <div>
                          <div className="st-danger-label">Delete Account</div>
                          <div className="st-danger-sub">Permanently removes all your data.</div>
                        </div>
                        <button className="st-btn-danger" onClick={() => {
                          if (window.confirm("This cannot be undone. Are you sure?")) logout(navigate)
                        }}>
                          <FiTrash2 size={13}/> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ══ NOTIFICATIONS ══ */}
              {section==="notifications" && (
                <div className="st-section">
                  <div className="st-section-head">
                    <h2 className="st-section-title"><FiBell size={16}/> Notification Preferences</h2>
                    <p className="st-section-sub">Control how and when Lost & Found NG contacts you.</p>
                  </div>
                  {[
                    { group:"Match Alerts",     icon:<FiCheckCircle size={14}/>, items:[
                      { key:"matchEmail",   label:"Email — New Match Found",  sub:"Email when AI finds a potential match"   },
                      { key:"matchSms",     label:"SMS — New Match Found",    sub:"Instant SMS when a match is detected"   },
                    ]},
                    { group:"Messages",         icon:<FiMail size={14}/>,        items:[
                      { key:"msgEmail",     label:"Email — New Message",      sub:"Email when you receive a message"       },
                      { key:"msgSms",       label:"SMS — New Message",        sub:"SMS when a finder messages you"         },
                    ]},
                    { group:"Platform Updates", icon:<FiBell size={14}/>,        items:[
                      { key:"weeklyDigest", label:"Weekly Digest Email",      sub:"Weekly summary of your reports"         },
                      { key:"pushAll",      label:"Push Notifications",       sub:"Browser push for all alerts"            },
                      { key:"fraudAlerts",  label:"Fraud & Safety Alerts",    sub:"Alerts about suspicious activity"       },
                    ]},
                  ].map(g => (
                    <div key={g.group} className="st-card st-card--mb">
                      <h3 className="st-card-title">{g.icon} {g.group}</h3>
                      {g.items.map(item => (
                        <div key={item.key} className="st-toggle-row">
                          <div className="st-toggle-info">
                            <div className="st-toggle-label">{item.label}</div>
                            <div className="st-toggle-sub">{item.sub}</div>
                          </div>
                          <Toggle on={notifs[item.key]} onToggle={() => toggleNotif(item.key)} label={item.label}/>
                        </div>
                      ))}
                    </div>
                  ))}
                  <div className="st-card">
                    <button className="st-btn-primary"
                      onClick={() => { LS.set(uKey(uid,"notifs"),notifs); showToast("Preferences saved!") }}>
                      <FiSave size={14}/> Save Preferences
                    </button>
                  </div>
                </div>
              )}

              {/* ══ PRIVACY ══ */}
              {section==="privacy" && (
                <div className="st-section">
                  <div className="st-section-head">
                    <h2 className="st-section-title"><FiShield size={16}/> Privacy & Safety</h2>
                    <p className="st-section-sub">Control who can see your information.</p>
                  </div>
                  <div className="st-card st-card--mb">
                    <h3 className="st-card-title">Profile Visibility</h3>
                    {[
                      { key:"publicProfile",  label:"Public Profile",       sub:"Others can view your profile and recovery history"    },
                      { key:"showPhone",      label:"Show Phone Number",    sub:"Your phone is visible to verified users only"         },
                      { key:"showLocation",   label:"Show Location",        sub:"Your general location is visible on your reports"     },
                      { key:"showActivity",   label:"Show Activity Status", sub:"Others can see when you were last active"             },
                      { key:"allowMessages",  label:"Allow Messages",       sub:"Finders/reporters can message you about your reports" },
                    ].map(item => (
                      <div key={item.key} className="st-toggle-row">
                        <div className="st-toggle-info">
                          <div className="st-toggle-label">{item.label}</div>
                          <div className="st-toggle-sub">{item.sub}</div>
                        </div>
                        <Toggle on={privacy[item.key]} onToggle={() => togglePrivacy(item.key)} label={item.label}/>
                      </div>
                    ))}
                  </div>
                  <div className="st-card">
                    <button className="st-btn-primary"
                      onClick={() => { LS.set(uKey(uid,"privacy"),privacy); showToast("Privacy settings saved!") }}>
                      <FiSave size={14}/> Save Privacy Settings
                    </button>
                  </div>
                </div>
              )}

              {/* ══ APPEARANCE ══ */}
              {section==="appearance" && (
                <div className="st-section">
                  <div className="st-section-head">
                    <h2 className="st-section-title"><FiMoon size={16}/> Appearance</h2>
                    <p className="st-section-sub">Customize how the app looks and feels.</p>
                  </div>
                  <div className="st-card st-card--mb">
                    <h3 className="st-card-title">Theme</h3>
                    <div className="st-theme-grid">
                      {[
                        { val:"light",  label:"Light",  icon:<FiSun size={20}/>        },
                        { val:"dark",   label:"Dark",   icon:<FiMoon size={20}/>       },
                        { val:"system", label:"System", icon:<FiSmartphone size={20}/> },
                      ].map(t => (
                        <button key={t.val}
                          className={`st-theme-card ${theme===t.val?"st-theme-card--active":""}`}
                          onClick={() => setTheme(t.val)}
                        >
                          <div className="st-theme-icon">{t.icon}</div>
                          <div className="st-theme-label">{t.label}</div>
                          {theme===t.val && <div className="st-theme-check"><FiCheckCircle size={14}/></div>}
                        </button>
                      ))}
                    </div>
                    <p className="st-appearance-info">🔔 Dark mode coming soon — Light mode is fully active.</p>
                  </div>
                  <div className="st-card st-card--mb">
                    <h3 className="st-card-title">Font Size</h3>
                    <div className="st-font-options">
                      {["small","medium","large"].map(s => (
                        <button key={s}
                          className={`st-font-btn ${fontSize===s?"st-font-btn--active":""}`}
                          onClick={() => setFontSize(s)}
                        >
                          <span style={{fontSize:s==="small"?12:s==="medium"?14:16}}>Aa</span>
                          <span>{s.charAt(0).toUpperCase()+s.slice(1)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="st-card">
                    <button className="st-btn-primary" onClick={saveAppearance}>
                      <FiSave size={14}/> Save Appearance
                    </button>
                  </div>
                </div>
              )}

              {/* ══ REGION ══ */}
              {section==="region" && (
                <div className="st-section">
                  <div className="st-section-head">
                    <h2 className="st-section-title"><FiGlobe size={16}/> Region & Language</h2>
                    <p className="st-section-sub">Set your country, currency, and preferred language.</p>
                  </div>
                  <div className="st-card">
                    {[
                      { label:"Country / Region", value:region,   set:setRegion,   options:["Nigeria","Ghana","Kenya","South Africa","Uganda","Tanzania"] },
                      { label:"Currency",          value:currency, set:setCurrency, options:["NGN – Nigerian Naira","GHS – Ghanaian Cedi","KES – Kenyan Shilling","USD – US Dollar"] },
                      { label:"Language",          value:language, set:setLanguage, options:["English","Yoruba","Hausa","Igbo","Pidgin"] },
                    ].map(f => (
                      <div key={f.label} className="st-form-group">
                        <label className="st-label">{f.label}</label>
                        <select className="st-select" value={f.value} onChange={e => f.set(e.target.value)}>
                          {f.options.map(o => <option key={o}>{o}</option>)}
                        </select>
                      </div>
                    ))}
                    <div className="st-card-footer">
                      <button className="st-btn-primary" onClick={saveRegion}>
                        <FiSave size={14}/> Save Region Settings
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ══ DATA ══ */}
              {section==="data" && (
                <div className="st-section">
                  <div className="st-section-head">
                    <h2 className="st-section-title"><FiDownload size={16}/> Data & Export</h2>
                    <p className="st-section-sub">Download a copy of your data or manage what we store.</p>
                  </div>
                  <div className="st-card st-card--mb">
                    <h3 className="st-card-title">Export My Data</h3>
                    <p className="st-data-desc">Download a JSON file containing all your reports, profile, and settings.</p>
                    <button className="st-btn-primary" onClick={exportData}>
                      <FiDownload size={14}/> Download My Data
                    </button>
                  </div>
                  <div className="st-card">
                    <h3 className="st-card-title">Data We Store</h3>
                    {[
                      { label:"Profile Information",   desc:"Name, email, phone, location, bio"      },
                      { label:"Reports",               desc:"All items you've reported as lost/found" },
                      { label:"Messages",              desc:"Chat history with finders/reporters"     },
                      { label:"Notification Settings", desc:"Your alert preferences"                  },
                      { label:"Saved Items",           desc:"Items you bookmarked from search"        },
                    ].map(d => (
                      <div key={d.label} className="st-data-row">
                        <div>
                          <div className="st-data-label">{d.label}</div>
                          <div className="st-data-sub">{d.desc}</div>
                        </div>
                        <FiCheckCircle size={14} style={{color:"var(--grn)",flexShrink:0}}/>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>{/* end st-content */}
          </div>{/* end st-layout */}
        </div>
      </DashboardLayout>
    </MainLayout>
  )
}
