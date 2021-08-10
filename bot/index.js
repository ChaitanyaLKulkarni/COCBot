require("dotenv").config();
const express = require("express");
const app = express();


// serve built frontend
// app.use(express.static(__dirname + "/client/build"));
// app.get("/web/*", (req, res) => {
//     res.sendFile(__dirname + "/client/build/index.html");
// });


const usersRouter = require('./routes/root')
app.use('/users', usersRouter);

const adminRouter = require('./routes/admin')
app.use('/admin', adminRouter)

// Start the twitch listener
const twitchListener = require('./bot');
twitchListener.runBot('node', ['twitchListenerService.js'], {
    detached: true
});

// start the server
app.listen(process.env.PORT || 5000, () => console.log("Server is running..."));
