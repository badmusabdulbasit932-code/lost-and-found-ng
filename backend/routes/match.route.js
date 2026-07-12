const express = require("express");
const router  = express.Router();

const auth = require("../middlewares/user.middleware");

const getMyMatches = require("../controllers/match/getMyMatches");
const getMatch     = require("../controllers/match/getMatch");
const acceptMatch  = require("../controllers/match/acceptMatch");
const rejectMatch  = require("../controllers/match/rejectMatch");

// All match routes require login
router.use(auth);

router.get("/",              getMyMatches);
router.get("/:id",           getMatch);
router.patch("/:id/accept",  acceptMatch);
router.patch("/:id/reject",  rejectMatch);

module.exports = router;