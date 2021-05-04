require("dotenv").config();
const express = require("express");
const Ctr = new require("./controller");
const app = express();
const fs = require("fs");

const controller = new Ctr();
app.use(express.static(__dirname + "/client/build"));

app.get("/web/*", (req, res) => {
    res.sendFile(__dirname + "/client/build/index.html");
});

//#region API
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

app.get("/api/summary/:channelName", async (req, res) => {
    const channelName = req.params.channelName.toLowerCase();
    //TODO: send Channel wise report only
    if (fs.existsSync(__dirname + "/data/prevMatches.min.json")) {
        const data = JSON.parse(
            fs.readFileSync(__dirname + "/data/prevMatches.min.json", {
                encoding: "utf-8",
            })
        );
        res.json({ status: 200, data });
    } else {
        res.status(404).send({ status: 404, message: "No File found!!" });
    }
});

//#endregion

//#region  ADMIM
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
    console.time("create");
    const proms = [];
    for (const match of op.prevMatches) {
        proms.push(controller.getMatchReport(match));
    }
    const jsonOp = await Promise.all(proms);
    console.timeLog("create", " Got All");
    const ret = {
        total: 0,
        fTotal: 0,
        sTotal: 0,
        rTotal: 0,
        players: [],
        languages: {},
    };
    for (const match of jsonOp) {
        ret.total++;

        let f = 0,
            s = 0,
            r = 0;
        if (match.mode === "FASTEST") {
            ret.fTotal++;
            f = 1;
        } else if (match.mode === "REVERSE") {
            ret.rTotal++;
            r = 1;
        } else if (match.mode === "SHORTEST") {
            ret.sTotal++;
            s = 1;
        }

        for (const player of match.players) {
            //Don't Include Bot
            if (player.codingamerId === 4265340) continue;

            const p = {
                playerId: player.codingamerId,
                name: player.codingamerNickname,
                handle: player.codingamerHandle,
                avatarId: player.codingamerAvatarId,
                rank: player.rank,
                language: player.languageId,
            };
            let index = ret.players.findIndex((v) => v.playerId === p.playerId);
            if (index === -1) {
                index = ret.players.push({
                    playerId: p.playerId,
                    name: p.name,
                    avatarId: p.avatarId,
                    handle: p.handle,
                    total: 0,
                    fTotal: 0,
                    rTotal: 0,
                    sTotal: 0,
                    languages: {},
                    won: 0,
                    fWon: 0,
                    rWon: 0,
                    sWon: 0,
                    ranks: { fastest: [], reverse: [], shortest: [] },
                });
                index--;
            }
            const pl = ret.players[index];
            pl.total++;
            if (f) {
                pl.fTotal++;
                pl.ranks.fastest.push(p.rank);
                if (p.rank === 1) pl.fWon++;
            } else if (r) {
                pl.rTotal++;
                pl.ranks.reverse.push(p.rank);
                if (p.rank === 1) pl.rWon++;
            } else if (s) {
                pl.sTotal++;
                pl.ranks.shortest.push(p.rank);
                if (p.rank === 1) pl.sWon++;
            }
            if (p.rank === 1) pl.won++;
            if (!p.language) continue;

            //Add Language
            if (!(p.language in pl.languages)) pl.languages[p.language] = 0;

            if (!(p.language in ret.languages)) ret.languages[p.language] = 0;

            pl.languages[p.language]++;
            ret.languages[p.language]++;
        }
    }
    console.timeEnd("create");
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
//#endregion

app.listen(process.env.PORT || 5000, () => console.log("Server is running..."));
