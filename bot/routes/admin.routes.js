const express = require("express");
const router = express.Router();

const {getAll, addMatch, createChannel} = require("../controllers/admin.controllers");

const checkAuth = (req, res, next) => {
    const auth = {
        login: process.env.ADMIN_USER,
        password: process.env.ADMIN_PASS,
    };
    const b64auth = (req.headers.authorization || "").split(" ")[1] || "";
    const [login, password] = Buffer.from(b64auth, "base64")
        .toString()
        .split(":");
    if (
        login &&
        password &&
        login === auth.login &&
        password === auth.password
    ) {
        return next();
    }

    res.set("WWW-Authenticate", 'Basic realm="401"');
    res.status(401).send("Authentication required.");
};

// admin routes
router.get("/view", checkAuth, getAll);
router.get("/set/:channelName/:matchId", checkAuth, addMatch);
router.get("/create/:channelName", checkAuth, createChannel);

module.exports = router
