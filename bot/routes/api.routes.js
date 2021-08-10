const express = require("express");
const router = express.Router();

const {currentMatchStats, prevMatchStats, channelSummary} = require("../controllers/api.controllers");

router.get("/api/:channelName", currentMatchStats);
router.get("/api/prev/:channelName", prevMatchStats);
router.get("/api/summary/:channelName", channelSummary);

module.exports = router
