const cocActions = new require("./actions");
const coc = new cocActions();

const db = require("../models/db");
db.init();


const currentMatchStats = async (req, res) => {
    const matches = await db.getLatestChannelMatch(req.params.channelName.toLowerCase());

    if (!matches || !matches.currentMatch) {
        res.json({ status: 404, message: "Not Found!" });
        return;
    }

    const matchId = matches.currentMatch;
    const report = await coc.getMatchReport(matchId);
    const isStarted = report.started;

    let ret = {
        status: 200,
        started: isStarted,
        matchId: matchId,
        noPlayers: report.players.length - 1,
    };

    if (isStarted) {
        ret["mode"] = report["mode"];
        ret["msBeforeEnd"] = report["msBeforeEnd"];
        ret["finished"] = report["finished"];
    }

    ret["players"] = report.players.map((player) => _getPlayerStats(player, isStarted));
    res.json(ret);
}

const prevMatchStats = async (req, res) => {
    const matches = await db.getChannelMatches(req.params.channelName.toLowerCase());
    if (!matches) {
        res.json([]);
        return;
    }

    const ret = matches.slice(0, 5).map(async (matchId) => {
        const matchData = await coc.getMatchReport(matchId);
        const winner = matchData.players[0];
        return {
            matchId: matchId,
            winner: {
                name: winner["codingamerNickname"],
                avatarId: winner["codingamerAvatarId"],
                rank: winner["rank"],
                duration: winner["duration"],
                language: winner["languageId"],
                criterion: winner["criterion"],
            },
        };
    })

    res.json(ret);
}

const channelSummary = async (req, res) => {
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
};

const _getPlayerStats = (player, isStarted) => {
    if (player["codingamerNickname"] === "SkyCOCBot") return; // TODO: make this dynamic

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
    return pInfo
}


module.exports = {
    currentMatchStats,
    prevMatchStats,
    channelSummary
}
