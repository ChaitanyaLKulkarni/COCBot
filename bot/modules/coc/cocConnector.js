const {default: axios} = require("axios");
const tough = require("tough-cookie");

const {default: axiosCookieJarSupport} = require("axios-cookiejar-support");
axiosCookieJarSupport(axios);


class cocConnector {
    constructor() {
        this.email = process.env.EMAIL;
        this.password = process.env.PASSWORD;
        this.cookieJar = new tough.CookieJar();
        this.login();
    }

    login() {
        axios
            .post(
                "https://www.codingame.com/services/Codingamer/loginSiteV2",
                [this.email, this.password, "true"],
                {
                    jar: this.cookieJar, // tough.CookieJar or boolean
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
                jar: this.cookieJar,
                withCredentials: true,
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
        await axios.post(url, jsonData, {
            jar: this.cookieJar,
            withCredentials: true,
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
            jar: this.cookieJar,
            withCredentials: true,
        });
        return res.data;
    }
}

module.exports = cocConnector