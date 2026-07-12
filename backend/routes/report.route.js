const express = require("express");
const router = express.Router();

const auth = require("../middlewares/user.middleware");
const { upload } = require("../config/cloudinary");

const createReport = require("../controllers/report/createReport");
const getAllReports = require("../controllers/report/getAllReports");
const getReport = require("../controllers/report/getReport");
const getMyReports = require("../controllers/report/getMyReports");
const updateReport = require("../controllers/report/updateReport");
const updateReportStatus = require("../controllers/report/updateReportStatus");
const deleteReport = require("../controllers/report/deleteReport");

// Public
router.get("/", getAllReports);
router.get("/my-reports", auth, getMyReports);
router.get("/:id", getReport);

// Protected
router.post("/", auth, upload.any(), createReport);
router.put("/:id", auth, upload.any(), updateReport);
router.patch("/:id/update-status", auth, updateReportStatus);
router.delete("/:id", auth, deleteReport);

module.exports = router;