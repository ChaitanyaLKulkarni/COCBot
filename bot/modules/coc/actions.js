/**
 * Clash of code match actions.
 * Apply actions to the COC server and log in the DB.
 */

const db = require("../../models/db");
const cocConnector = require('./cocConnector')

class cocActions {
    constructor() {
        this.coc = new cocConnector()

        this.db = db
        this.db.init()
    }

    async matchHandler(opts) {
        const info = await this.db.getLatestChannelMatch(channelName);
        const currentMatch = !info ? "" : info.currentMatch;

        if (currentMatch) {
            if (opts[0] === "start") {
                return this.startMatch(currentMatch)
            }

            if (opts[0] === "cancel") {
                return this.cancelMatch()
            }
        }

        return this.createMatch(opts)
    }

    async createMatch(opts) {
        const modes = ["FASTEST", "SHORTEST", "REVERSE"];
        let selectedModes = [];
        let languages = [
            "Bash",
            "VB.NET",
            "C++",
            "C#",
            "C",
            "Clojure",
            "D",
            "Dart",
            "F#",
            "Go",
            "Groovy",
            "Haskell",
            "Java",
            "Javascript",
            "Kotlin",
            "Lua",
            "ObjectiveC",
            "OCaml",
            "Pascal",
            "Perl",
            "PHP",
            "Python3",
            "Ruby",
            "Rust",
            "Scala",
            "Swift",
            "TypeScript",
        ];
        let selectedLang = [];

        if (opts.length > 0) {
            for (const opt of opts) {
                //Check for Mode
                if (["f", "fast", "fastest"].includes(opt)) {
                    selectedModes.push("FASTEST");
                } else if (["s", "short", "shortest"].includes(opt)) {
                    selectedModes.push("SHORTEST");
                } else if (["r", "reverse"].includes(opt)) {
                    selectedModes.push("REVERSE");
                } else {
                    for (const lang of languages) {
                        if (lang.toLowerCase() === opt.toLowerCase()) {
                            selectedLang.push(lang);
                            break;
                        }
                    }
                }
            }
        }
        if (selectedModes.length === 0) selectedModes = [...modes];
        else selectedModes = [...new Set(selectedModes)]; //Gets unique only
        const res = await this.createPrivateMatch(selectedModes, selectedLang);

        const newMatchId = res.split("/").slice(-1)[0];
        await this.db.addMatch(channelName, newMatchId);

        return res;
    }

    async startMatch(currentMatch) {
        const report = await this.coc.getMatchReport(currentMatch);
        if (!report.started) {
            await this.coc.startMatch(currentMatch);
            return `Starting with ${report.players.length - 1} players:`;
        }
    }

    async cancelMatch() {
        await this.db.removeCurrentMatch(channelName);
        return "Cancelled Current Match!";
    }

    async matchStatistics(channel) {
        return await this.db.getLatestChannelMatch(channel);
    }
}

module.exports = cocActions;
