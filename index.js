require("dotenv").config();
const express = require("express");
const Ctr = new require("./controller");
const app = express();
const fs = require("fs");
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const controller = new Ctr();
app.use(express.static(__dirname + "/client/build"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/client/build/index.html");
});
app.get("/web/:channelName", (req, res) => {
    res.sendFile(__dirname + "/client/build/index.html");
});

app.get("/api/:channelName", async (req, res) => {
    const channelName = req.params.channelName.toLowerCase();
    const op = await controller.db.getChannelMatches(channelName);
    if (!op || !op.currentMatch) {
        res.json({ status: 404, message: "Not Found!" });
        return;
    }
    const matchId = op.currentMatch;
    const report = await controller.getMatchReport(matchId);
    const isStarted = report.started;

    const ret = {
        status: 200,
        started: isStarted,
        matchId: matchId,
        noPlayers: report.players.length - 1,
        players: [],
    };

    if (isStarted) {
        ret["mode"] = report["mode"];
        ret["msBeforeEnd"] = report["msBeforeEnd"];
        ret["finished"] = report["finished"];
    }
    report.players.forEach((player) => {
        if (player["codingamerNickname"] === "SkyCOCBot") return;

        const pInfo = {
            name: player["codingamerNickname"],
            avatarId: player["codingamerAvatarId"],
        };

        if (isStarted) {
            const isCompleted = player["testSessionStatus"] === "COMPLETED";
            pInfo["finished"] = isCompleted;

            if (isCompleted) {
                pInfo["rank"] = player["rank"];
                pInfo["duration"] = player["duration"];
                pInfo["language"] = player["languageId"];
                pInfo["criterion"] = player["criterion"];
            }
        }
        ret["players"].push(pInfo);
    });
    res.json(ret);
});

app.get("/api/prev/:channelName", async (req, res) => {
    const channelName = req.params.channelName.toLowerCase();
    const op = await controller.db.getChannelMatches(channelName);
    if (!op) {
        res.json([]);
        return;
    }
    const ret = [];
    for (const match of op.prevMatches.slice(0, 5)) {
        const m = await controller.getMatchReport(match);
        const w = m["players"][0];
        const o = {
            matchId: match,
            winner: {
                name: w["codingamerNickname"],
                avatarId: w["codingamerAvatarId"],
                rank: w["rank"],
                duration: w["duration"],
                language: w["languageId"],
                criterion: w["criterion"],
            },
        };
        ret.push(o);
    }
    res.json(ret);
});

// ADMIN ZONE:
app.use((req, res, next) => {
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

    // -----------------------------------------------------------------------
});

app.get("/view", async (req, res) => {
    const op = await controller.db.getAll();
    res.send(op);
});

app.get("/set/:channelName/:matchId", async (req, res) => {
    await controller.db.addMatch(
        req.params.channelName.toLowerCase(),
        req.params.matchId,
        true
    );
});

app.get("/create/:channelName", async (req, res) => {
    const channelName = req.params.channelName.toLowerCase();
    const op = await controller.db.getChannelMatches(channelName);
    if (!op) {
        res.json([]);
        return;
    }
    let i = 0;
    const proms = [];
    for (const match of op.prevMatches) {
        proms.push(controller.getMatchReport(match));
    }
    const ret = [];
    const jsonOp = await Promise.all(proms);
    for (const match of jsonOp) {
        const matchObj = {
            matchId: match.publicHandle,
            mode: match.mode,
            startTime: match.startTime,
            endTime: match.endTime,
            players: [],
        };
        for (const player of match.players) {
            if (player.codingamerId === 4265340) continue;
            const pObj = {
                playerId: player.codingamerId,
                name: player.codingamerNickname,
                handle: player.condingamerHandle,
                avatarId: player.codingamerAvatarId,
                score: player.score,
                rank: player.rank,
                language: player.languageId,
                criterion: player.criterion,
            };
            matchObj.players.push(pObj);
        }
        ret.push(matchObj);
    }
    fs.writeFileSync(
        __dirname + "/data/prevMatches.json",
        JSON.stringify(ret, null, 2)
    );
    fs.writeFileSync(
        __dirname + "/data/prevMatches.min.json",
        JSON.stringify(ret)
    );
    res.json(ret);
});
app.listen(process.env.PORT || 5000, () => console.log("Server is running..."));
