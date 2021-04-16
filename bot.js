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

client.connect().catch(console.error);

client.on("message", async (channel, user, message, self) => {
    if (self) return;
    if (message[0] !== prefix) return;
    message = message.slice(prefix.length);
    channel = channel.slice(1); //Removes #

    const isMod =
        user.mod || user["user-type"] === "mod" || channel === user.username;

    channel = channel.toLowerCase();
    opts = message.split(" ");
    cmd = opts.shift();
    console.log(cmd);
    let op = "";
    switch (cmd) {
        case "coc":
            op = await client.on_cocCmd(channel, opts, isMod);
            break;

        case "link":
        case "l":
            op = await client.on_linkCmd(channel, opts, isMod);
            break;

        case "add":
        case "set":
            op = await client.on_addCmd(channel, opts, isMod);
            break;

        case "remove":
        case "reset":
            op = await client.on_removeCmd(channel, opts, isMod);
            break;
        case "help":
            op = client.on_helpCmd(channel, opts, isMode);
            for (let o in op) {
                client.say(o);
            }
            return;
        default:
            op = await client.on_elseCmd(channel, cmd, isMod);
    }
    if (op) client.say(channel, op);
});

module.exports = client;
