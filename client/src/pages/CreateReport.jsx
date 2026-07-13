import {
  FiHelpCircle,
  FiShield,
  FiBox,
  FiMapPin,
  FiImage,
  FiAward,
  FiInfo,
  FiArrowRight,
  FiCheck,
  FiArrowLeft,
  FiHome,
} from "react-icons/fi"

import { useState, Fragment } from "react"

import { useNavigate } from "react-router-dom"

import MainLayout from "../layouts/MainLayout"
import Footer from "../components/Footer"

import "../styles/createReport.css"

function CreateReport() {

  const navigate = useNavigate()

  const [step, setStep] = useState(1)

  const [selectedType, setSelectedType] =
    useState("")

  const [title, setTitle] =
    useState("")

  const [category, setCategory] =
    useState("")

  const [description, setDescription] =
    useState("")

  const [location, setLocation] =
    useState("")

  const [reward, setReward] =
    useState("")

  const [image, setImage] =
    useState("")
  const [imageFile, setImageFile] = useState(null)

  // FIX: track whether image came from file upload (blob) or URL input
  const [imageIsBlob, setImageIsBlob] =
    useState(false)

  const [error, setError] =
    useState("")

  // =========================
  // NEXT STEP
  // =========================

  const nextStep = () => {

    setError("")

    if (step === 1 && !selectedType) {
      setError("Please select whether you lost or found an item.")
      return
    }

    if (step === 2) {
      if (!title || !category || !description) {
        setError("Please fill all item information fields.")
        return
      }
    }

    if (step === 3 && !location) {
      setError("Please enter the location.")
      return
    }

    // FIX: step 4 image is optional — warn but don't block
    // If you want to make it required, keep the check; removed hard block here
    // so users can skip if they have no photo

    setStep(step + 1)

  }

  // =========================
  // PREVIOUS STEP
  // =========================

  const prevStep = () => {
    setError("")
    if (step > 1) setStep(step - 1)
  }

  // =========================
  // REWARD — enforce ₦ prefix
  // =========================

  const handleRewardChange = (e) => {

    let val = e.target.value

    // Strip any existing ₦ then re-add it
    val = val.replace(/^₦/, "")

    // Only allow digits and commas
    val = val.replace(/[^\d,]/g, "")

    setReward(val ? `₦${val}` : "")

  }

  // =========================
  // IMAGE UPLOAD
  // =========================

  const handleImageUpload = (e) => {

    const file = e.target.files[0]

    if (file) {

      // Save the actual File object for FormData upload
      setImageFile(file)

      // Also create a preview URL for display only
      const reader = new FileReader()
      reader.onload = () => setImage(reader.result)
      reader.readAsDataURL(file)

    }

  }
  // =========================
  // SUBMIT REPORT
  // =========================

  const handleSubmit = async () => {

    // Image is required
    if (!imageFile) {
      setError("Please upload at least one image of the item.")
      return
    }

    // Build FormData — required for file uploads
    const formData = new FormData()

    // Add all report fields
    formData.append("title", title)
    formData.append("description", description)
    formData.append("type", selectedType)
    formData.append("category", category.toLowerCase())
    formData.append("location", location)
    formData.append("reward", reward || "")

    // Add the image file
    // "images" must match what your backend multer expects
    formData.append("images", imageFile)

    // Import the createReport service
    const { createReport } = await import("../services/reportService")

    // Import alert utilities
    const alert = await import("../utils/alert")
    const Swal = (await import("sweetalert2")).default

    // Show loading spinner
    alert.loading("Submitting your report...")

    try {

      // Call the backend
      await createReport(formData)

      // Close spinner
      Swal.close()

      // Show success popup
      await alert.success(
        "Your report has been submitted. We will start matching immediately.",
        "Report Created! 🎉"
      )

      // Redirect to my reports
      navigate("/reports")

    } catch (err) {

      Swal.close()

      alert.error(
        err.message || "Failed to submit report. Please try again.",
        "Submission Failed"
      )

    }

  }

  // =========================
  // STEP PROGRESS ITEMS
  // =========================

  const steps = [
    { icon: <FiHelpCircle />, label: "Type", sub: "Select report type" },
    { icon: <FiBox />, label: "Information", sub: "Item details" },
    { icon: <FiMapPin />, label: "Location", sub: "Where it happened" },
    { icon: <FiImage />, label: "Images", sub: "Upload photos" },
    { icon: <FiAward />, label: "Finish", sub: "Review & submit" },
  ]

  return (

    <MainLayout>

      <div className="create-report-page">

        <div className="create-report-container">

          {/* HEADER */}

          <div className="create-report-header">

            <button
              className="dashboard-btn"
              onClick={() => navigate("/dashboard")}
            >
              <FiHome />
              Dashboard
            </button>

          </div>

          {/* TITLE */}

          <div className="create-report-top">

            <div>

              <h1>Create New Report</h1>

              <p>
                Start the recovery process by reporting
                a lost or found item across Nigeria.
              </p>

            </div>

          </div>

          {/* ERROR */}

          {error && (
            <div className="step-error-message">
              {error}
            </div>
          )}

          {/* STEPS — FIX: built from array, no repetition */}

          <div className="report-steps">

            {steps.map((s, i) => (

              <Fragment key={s.label}>

                <div
                  className={`step-item ${step >= i + 1 ? "active-step" : ""}`}
                >

                  <div className="step-circle">
                    {step > i + 1
                      ? <FiCheck />
                      : s.icon}
                  </div>

                  <div className="step-text">
                    <h4>{s.label}</h4>
                    <span>{s.sub}</span>
                  </div>

                </div>

                {i < steps.length - 1 && (
                  <div
                    className={`step-line ${step > i + 1 ? "active-line" : ""}`}
                  />
                )}

              </Fragment>

            ))}

          </div>

          {/* ── STEP 1: Type ── */}

          {step === 1 && (

            <div className="report-type-section">

              <div
                className={`report-type-card ${selectedType === "lost" ? "active" : ""}`}
                onClick={() => setSelectedType("lost")}
              >

                <div className="select-indicator">
                  <FiCheck />
                </div>

                <div className="type-icon lost-icon">
                  <FiHelpCircle />
                </div>

                <h2>I Lost Something</h2>

              </div>

              <div
                className={`report-type-card ${selectedType === "found" ? "active" : ""}`}
                onClick={() => setSelectedType("found")}
              >

                <div className="select-indicator">
                  <FiCheck />
                </div>

                <div className="type-icon found-icon">
                  <FiShield />
                </div>

                <h2>I Found Something</h2>

              </div>

            </div>

          )}

          {/* ── STEP 2: Item Info ── */}

          {step === 2 && (

            <div className="step-content-card">

              <div className="report-form-grid">

                <div className="report-form-group">

                  <label>Item Title</label>

                  <input
                    type="text"
                    placeholder="e.g. MacBook Pro"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />

                </div>

                <div className="report-form-group">

                  <label>Category</label>

                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >

                    <option value="">Select Category</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Phones">Phones</option>
                    <option value="Documents">Documents</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Jewellery">Jewellery</option>
                    <option value="Bags">Bags</option>
                    <option value="Keys">Keys</option>
                    <option value="Other">Other</option>

                  </select>

                </div>

                <div className="report-form-group full">

                  <label>
                    Description
                    <span className="char-hint">
                      {description.length}/500
                    </span>
                  </label>

                  <textarea
                    placeholder="Describe the item in detail — colour, brand, unique markings..."
                    value={description}
                    maxLength={500}
                    onChange={(e) => setDescription(e.target.value)}
                  />

                </div>

              </div>

            </div>

          )}

          {/* ── STEP 3: Location & Reward ── */}

          {step === 3 && (

            <div className="step-content-card">

              <div className="location-grid">

                <div className="report-form-group">

                  <label>Location</label>

                  <input
                    type="text"
                    placeholder="e.g. Ikeja, Lagos"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />

                </div>

                <div className="report-form-group">

                  <label>
                    Reward
                    <span className="field-hint">
                      (optional)
                    </span>
                  </label>

                  {/* FIX: ₦ prefix enforced */}

                  <input
                    type="text"
                    placeholder="₦50,000"
                    value={reward}
                    onChange={handleRewardChange}
                  />

                </div>

              </div>

            </div>

          )}

          {/* ── STEP 4: Images ── */}

          {step === 4 && (

            <div className="step-content-card">

              <div className="image-upload-wrapper">

                {/* URL input */}
                {/* 
                <div className="report-form-group">

                  <label>Paste Image URL</label>

                  <input
                    type="text"
                    placeholder="https://example.com/image.jpg"
                    value={imageIsBlob ? "" : image}
                    onChange={(e) => {
                      setImage(e.target.value)
                      setImageIsBlob(false)
                    }}
                  />

                </div> */}

                {/* <div className="upload-divider">
                  <span>OR</span>
                </div> */}

                {/* File upload — FIX: uses FileReader not createObjectURL */}

                <label className="upload-dropzone">

                  <FiImage />

                  <h3>Upload Image</h3>

                  <p>Click to upload from your device</p>

                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageUpload}
                  />

                </label>

                {/* Preview */}

                {image && (

                  <div className="preview-image-card">

                    <img src={image} alt="Preview" />

                    <button
                      className="remove-image-btn"
                      onClick={() => {
                        setImage("")
                        setImageIsBlob(false)
                      }}
                    >
                      ×
                    </button>

                  </div>

                )}

                <p className="image-optional-note">
                  Image is important to improves match accuracy.
                </p>

              </div>

            </div>

          )}

          {/* ── STEP 5: Review & Submit ── */}

          {step === 5 && (

            <div className="step-content-card">

              <div className="review-card">

                <h3>Report Summary</h3>

                {[
                  { label: "TYPE", value: selectedType },
                  { label: "TITLE", value: title },
                  { label: "CATEGORY", value: category },
                  { label: "DESCRIPTION", value: description },
                  { label: "LOCATION", value: location },
                  { label: "REWARD", value: reward || "₦0" },
                ].map((row) => (

                  <div key={row.label} className="review-row">
                    <span>{row.label}</span>
                    <p>{row.value}</p>
                  </div>

                ))}

              </div>

              {image && (
                <img
                  src={image}
                  alt="Preview"
                  className="review-final-image"
                />
              )}

            </div>

          )}

          {/* TIP */}

          <div className="report-tip">

            <div className="tip-icon">
              <FiInfo />
            </div>

            <div>
              <h4>Pro Tip</h4>
              <p>Clear descriptions and images improve recovery success.</p>
            </div>

          </div>

          {/* BUTTONS */}

          <div className="report-bottom">

            {step > 1 && (

              <button
                className="back-step-btn"
                onClick={prevStep}
              >
                <FiArrowLeft />
                Back
              </button>

            )}

            <button
              className="continue-btn"
              onClick={step === 5 ? handleSubmit : nextStep}
            >
              {step === 5 ? "Submit Report" : "Continue"}
              <FiArrowRight />
            </button>

          </div>

        </div>

      </div>

      <Footer />

    </MainLayout>

  )

}

export default CreateReport