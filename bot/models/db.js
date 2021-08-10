const { MongoClient } = require("mongodb");
let client = null;
let matchInfo = null;
let commandsInfo = null;
let db = null;

const init = async () => {
    const uri = process.env.MONGODB_URI
    client = new MongoClient(uri, { useUnifiedTopology: true });

    await client.connect();
    db = client.db("bot");
    matchInfo = db.collection("matches");
    commandsInfo = db.collection("commands");
};

const getAll = async () => {
    const cursor = matchInfo.find({});
    if ((await cursor.count()) === 0) {
        console.log("No documents found!");
    }
    const op = [];
    await cursor.forEach((m) => {
        op.push(m);
    });
    return op;
};

const addMatch = async (channelName, matchId, removeCurrent = false) => {
    const chobj = await getChannelMatches(channelName);
    let prev = [];
    if (chobj) {
        prev = chobj["prevMatches"];
        if (chobj["currentMatch"] !== "" && !removeCurrent) {
            prev.unshift(chobj["currentMatch"]);
        }
    }
    const query = {
        $set: {
            currentMatch: matchId,
            prevMatches: prev,
        },
    };
    const op = await matchInfo.updateOne({ _id: channelName }, query, {
        upsert: true,
    });
    return op;
};

const removeCurrentMatch = async (channelName) => {
    const op = await matchInfo.updateOne(
        { _id: channelName },
        { $set: { currentMatch: "" } }
    );
    return op;
};

const getLatestChannelMatch = async (channelName) => {
    const op = await matchInfo.findOne({ _id: channelName });
    return op;
};

const getChannelMatches = async (channelName) => {
    const op = await matchInfo.find({ _id: channelName });
    return op;
};

// const getChannelCommands = async (channelName) => {
//     const op = await commandsInfo.findOne({ _id: channelName });
//     return op;
// };
//
// const addCommand = async (channelName, command, response) => {
//     const op = await commandsInfo.updateOne(
//         { _id: channelName },
//         { $set: { [command]: response } },
//         { upsert: true }
//     );
//     return op;
// };
// const getCommands = async () => {
//     const cursor = commandsInfo.find({});
//     if ((await cursor.count()) === 0) {
//         console.log("No documents found!");
//     }
//     const op = {};
//     await cursor.forEach((m) => {
//         const channelName = m._id;
//         delete m._id;
//         op[channelName] = { ...m };
//     });
//     return op;
// };
//
// const removeCommand = async (channelName, command) => {
//     const op = await commandsInfo.updateOne(
//         { _id: channelName },
//         { $unset: { [command]: "" } }
//     );
// };

module.exports = {
    init,
    getAll,
    addMatch,
    removeCurrentMatch,
    getLatestChannelMatch,
    getChannelMatches,
    // getChannelCommands,
    // addCommand,
    // getCommands,
    // removeCommand,
};
