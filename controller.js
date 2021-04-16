const bot = require("./bot");
const db = require("./db");
const axios = require("axios").default;
const axiosCookieJarSupport = require("axios-cookiejar-support").default;
const tough = require("tough-cookie");

axiosCookieJarSupport(axios);

const cookieJar = new tough.CookieJar();

class Controller {
    constructor() {
        this.email = process.env.EMAIL;
        this.password = process.env.PASSWORD;
        this.myId = null;
        this.db = db;
        this.db
            .init()
            .then(async () => (this.commands = await this.db.getCommands()))
            .catch((err) => console.log(err));
        this.login();
        //Setting callBack function
        bot.on_cocCmd = this.onCocCmd.bind(this);
        bot.on_linkCmd = this.onLinkCmd.bind(this);
        bot.on_addCmd = this.onAddCmd.bind(this);
        bot.on_removeCmd = this.onRemoveCmd.bind(this);
        bot.on_elseCmd = this.onElseCmd.bind(this);
        bot.on_helpCmd = this.onHelpCmd.bind(this);
    }
    login() {
        axios
            .post(
                "https://www.codingame.com/services/Codingamer/loginSiteV2",
                [this.email, this.password, "true"],
                {
                    jar: cookieJar, // tough.CookieJar or boolean
                    withCredentials: true, // If true, send cookie stored in jar
                }
            )
            .then((d) => d.data)
            .then((data) => {
                this.myId = data["codinGamer"]["userId"];
                console.log("Logged in");
            })
            .catch((err) => console.log(err));
    }

    async createPrivateMatch(
        modes = ["FASTEST", "SHORTEST", "REVERSE"],
        languages = []
    ) {
        if (!this.myId) {
            console.log("ERROR Not logged in");
            return "Not Logged In!!!";
        }
        const url =
            "https://www.codingame.com/services/ClashOfCode/createPrivateClash";
        const jsonData = [this.myId, { SHORT: "true" }, languages, modes];
        const data = await axios
            .post(url, jsonData, {
                jar: cookieJar, // tough.CookieJar or boolean
                withCredentials: true, // If true, send cookie stored in jar
            })
            .then((d) => d.data)
            .catch((err) => {
                console.log("Error while creating Match", err);
            });
        const matchId = data["publicHandle"];
        return `Join Clash: https://www.codingame.com/clashofcode/clash/${matchId}`;
    }

    async startMatch(matchId) {
        if (!this.myId) {
            console.log("Not Logged In!");
            return "ERROR Not Logged In!";
        }
        const url =
            "https://www.codingame.com/services/ClashOfCode/startClashByHandle";
        const jsonData = [this.myId, matchId];
        const res = await axios.post(url, jsonData, {
            jar: cookieJar, // tough.CookieJar or boolean
            withCredentials: true, // If true, send cookie stored in jar
        });
        const op = await this.getMatchReport(matchId);
        return op.players.length - 1;
    }

    async getMatchReport(matchId) {
        if (!this.myId) {
            console.log("ERROR While getting Report!!");
            return;
        }

        const url =
            "https://www.codingame.com/services/ClashOfCode/findClashReportInfoByHandle";
        const jsonData = [matchId];
        const res = await axios.post(url, jsonData, {
            jar: cookieJar, // tough.CookieJar or boolean
            withCredentials: true, // If true, send cookie stored in jar
        });
        return res.data;
    }

    //BOt COMMMANDS:

    async onCocCmd(channelName, opts, isMod) {
        if (!isMod) {
            return "Only Mods are allowed!";
        }
        const info = await this.db.getChannelMatches(channelName);
        const currentMatch = !info ? "" : info.currentMatch;
        //No Current Match
        if (currentMatch) {
            if (opts[0] === "cancel") {
                await this.db.removeCurrentMatch(channelName);
                return "Cancelled Current Match!";
            }
            const report = await this.getMatchReport(currentMatch);
            if (!report.started) {
                this.startMatch(currentMatch);
                return `Starting with ${report.players.length - 1} players:`;
            }
        }
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
        const op = await this.db.addMatch(channelName, newMatchId);
        return res;
    }

    async onLinkCmd(channelName, opts, isMod) {
        const op = await this.db.getChannelMatches(channelName);
        const matchId = op ? op.currentMatch : "";
        if (!matchId) return "No Clash Running!";
        return `Join Clash: https://www.codingame.com/clashofcode/clash/${matchId}  ${Math.floor(
            Math.random() * 10
        )}`;
    }

    onHelpCmd(channelName, opts, isMod) {
        const op = [];
        if (isMod) {
            op.pust(
                "Manage Commands:|| !add | !set <command> <response> : After that !<command> will send back <response> ||    !remove | !reset <command> : deletes the <command></command>"
            );
        }
        op.push(
            "COC Bot:  !coc : reset | c[ancel] Cancels current Lobby ||   \
                !coc : Create new lobby, optional parameters to set Mode: f[astest] s[hortest] r[everse] ||  \
                !coc : Start current lobby if any and has not been Started ||  \
                !l[ink] : gives link of current lobby"
        );
        const cust = Object.keys(this.commands[channelName]).reduce(
            (p, a) => p + "   ||   " + a
        );
        op.push("Other Commands: " + cust);
        return;
    }

    async onAddCmd(channelName, opts, isMod) {
        if (!isMod) return;
        if (!this.commands[channelName]) this.commands[channelName] = {};

        if (opts.length < 2) {
            return "Wrong! Usage: !add <command> <response>";
        }
        const cmd = opts.shift().toLowerCase();
        const response = opts.join(" ");
        this.commands[channelName][cmd] = response;
        const op = await this.db.addCommand(channelName, cmd, response);
        return "Successfully added command: " + cmd;
    }

    async onRemoveCmd(channelName, cmd, isMod) {
        if (!isMod) return;
        cmd = cmd[0].toLowerCase();
        console.log(channelName, cmd, this.commands);
        if (!this.commands[channelName] || !this.commands[channelName][cmd])
            return "Not Found!";

        delete this.commands[channelName][cmd];
        const op = await db.removeCommand(channelName, cmd);
        return "Successfully removed command: " + cmd;
    }

    async onElseCmd(channelName, cmd, isMod) {
        if (!this.commands[channelName] || !this.commands[channelName][cmd])
            return;
        return this.commands[channelName][cmd];
    }
}

module.exports = Controller;
