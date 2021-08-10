const tmi = require("tmi.js");

const prefix = process.env.BOT_PREFIX;

const client = new tmi.Client({
    options: {},
    connection: {
        reconnect: true,
        secure: true,
    },
    identity: {
        username: process.env.BOT_NICK,
        password: process.env.TMI_TOKEN,
    },
    channels: process.env.CHANNELS.split(","),
});

const cocActions = require("./modules/coc/actions")
const coc = new cocActions();

 const getResponse = async (message, channel, isMod) => {
     const opts = message.split(" ");
     const cmd = opts.shift();

     switch (cmd) {
         case "coc":
             if (!isMod) {return "Only Mods are allowed!";}
             return coc.matchHandler(opts)

         case "link":
         case "l":
             const match = await this.coc.matchStatistics(channelName)
             const matchId = match && match.currentMatch;

             if (!matchId) return "No Clash Running!";

             return `Join Clash: https://www.codingame.com/clashofcode/clash/${matchId}  ${Math.floor(
                 Math.random() * 10
             )}`;

         case "help":
             const response = ["COC Bot: "];
             if (isMod) {
                 response.push(
                     "!coc : reset | c[ancel] Cancels current Lobby ||  !coc : Create new lobby, optional parameters to set Mode: f[astest] s[hortest] r[everse] ||  !coc : Start current lobby if any and has not been Started ||"
                 );
             }
             response.push(
                 "!l[ink] : gives link of current lobby"
             );

             for (const o of response) {
                 if (!o) continue;
                 await client.say(channel, o);
             }
             return;

         default:
             return "Invalid command";
     }
 }

client.on("message", async (channel, user, message, self) => {
    if (self) return;
    if (message[0] !== prefix) return;
    message = message.slice(prefix.length);
    channel = channel.slice(1).toLowerCase();

    const isMod =
        user.mod || user["user-type"] === "mod" || channel === user.username;

    let response = getResponse(message, channel, isMod);
    if (response) client.say(channel, response);
});

const runBot = function() {
    client.connect().catch(console.error);
}

module.exports = { runBot }
