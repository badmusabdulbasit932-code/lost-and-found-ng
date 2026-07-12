const express = require("express")
const router = express.Router()

const auth = require("../middlewares/user.middleware")
const { upload } = require("../config/cloudinary")

const createUserAccount = require("../controllers/user/createUserAccount")
const verifyEmail = require("../controllers/user/verifyEmail")
const loginUserAccount = require("../controllers/user/login")
const getMe = require("../controllers/user/getMe")
const updateProfile = require("../controllers/user/updateProfile")
const uploadAvatar = require("../controllers/user/uploadAvatar")
const forgotPassword = require("../controllers/user/forgotPassword")
const resetPassword = require("../controllers/user/resetPassword")
const changePassword = require("../controllers/user/changePassword")

// Public
router.post("/signup", createUserAccount)
router.post("/verify", verifyEmail)
router.post("/login", loginUserAccount)
router.post("/forgot-password", forgotPassword)
router.post("/reset-password", resetPassword)

// Protected
router.get("/me", auth, getMe)
router.put("/me", auth, updateProfile)
router.post("/avatar", auth, upload.single("avatar"), uploadAvatar)
router.post("/change-password", auth, changePassword)

module.exports = router