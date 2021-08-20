const cocActions = new require("./actions");
const coc = new cocActions();

const db = require("../models/db");
db.init();

const getAll = async (req, res) => {
    const op = await db.getAll();
    res.send(op);
};

const addMatch = async (req, res) => {
    await db.addMatch(
        req.params.channelName.toLowerCase(),
        req.params.matchId,
        true
    );
};

const createChannel = async (req, res) => {
    const channelName = req.params.channelName.toLowerCase();
    const op = await db.getChannelMatches(channelName);
    if (!op) {
        res.json([]);
        return;
    }
    console.time("create");
    const proms = [];
    for (const match of op.prevMatches) {
        proms.push(coc.getMatchReport(match));
    }
    const jsonOp = await Promise.all(proms);
    console.timeLog("create", " Got All");
    const ret = {
        total: 0,
        fTotal: 0,
        sTotal: 0,
        rTotal: 0,
        players: [],
        languages: [],
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
                    languages: [],
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
            if (p.language === "undefined" || p.language === null) continue;

            // Add Language
            // TODO: Improve Performance :
            // Use Dictionary and parse it to array at the end making complexcity O(2n) rather than O(n^2)
            let lanIndex = pl.languages.findIndex((v) => v.name === p.language);
            if (lanIndex === -1) {
                lanIndex = pl.languages.push({ name: p.language, used: 0 });
                lanIndex--;
            }
            pl.languages[lanIndex].used++;

            // Global languages
            let glanIndex = ret.languages.findIndex(
                (v) => v.name === p.language
            );
            if (glanIndex === -1) {
                glanIndex = ret.languages.push({
                    name: p.language,
                    used: 0,
                });
                glanIndex--;
            }
            ret.languages[glanIndex].used++;
        }
    }
    console.timeEnd("create");
    res.json(ret);
};

module.exports = {
    getAll,
    addMatch,
    createChannel
}
