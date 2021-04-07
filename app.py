import os
import asyncio
from threading import Thread
from dotenv import load_dotenv
from flask import Flask, jsonify
from bot import Bot
import controller

load_dotenv("./.env")
# credentials
TMI_TOKEN = os.environ.get('TMI_TOKEN')
CLIENT_ID = os.environ.get('CLIENT_ID')
BOT_NICK = os.environ.get('BOT_NICK')
BOT_PREFIX = os.environ.get('BOT_PREFIX')
CHANNELS = os.environ.get('CHANNEL').split("\s")
EMAIL = os.environ.get('EMAIL')
PASSWORD = os.environ.get('PASSWORD')


app = Flask(__name__)

currents = {}

botThread = None


@app.route('/')
def index():
    return "Hello "


@app.route('/start')
def startBot():
    global botThread
    if botThread is None:
        botThread = Thread(target=handleBot, daemon=True)
        botThread.start()
        controller.login(EMAIL, PASSWORD)
        return jsonify({"status": 202, "message": "Starting bot..."})

    return jsonify({"status": 200, "message": "Bot Running."})


@app.route("/api/<channleName>")
def getDetail(channleName):
    """
        return current Match detail
    """
    if channleName in currents:
        ret = currents[channleName].copy()
        ret["status"] = 200
    else:
        ret = {"status": 404, "message": "Not Found!!!"}

    return jsonify(ret)


@ app.route("/web/<channleName>")
def getChannelView(channleName):
    """
        return the template with the channel name
        in js store data locally
    """
    pass


def handle_onCoc(msg):
    """Handle COC command that only works if called by Mod

    Args:
        ctx (Contex): Contex 

    Returns:
        str: String to send back to Chat
    """
    options = msg.split()
    # print(options)
    if len(options) == 2:
        if options[1].lower() in ["reset", "cancle", "c"]:
            controller.leaveCurrentClash()
            return "Current Clashed Cancled!!! "

    if controller.matchId is not None:
        data = controller.getReport()
        if data['started'] == False:
            controller.startMatch()
            return f"Starting with {str(len(data['players']) - 1)} Players"

    modes = ["FASTEST", "SHORTEST", "REVERSE"]
    if len(options) == 2:
        op = options[1].lower()
        if op in ["f", "fast", "fastest"]:
            modes = modes[:1]
        elif op in ["s", "short", "shortest"]:
            modes = modes[1:2]
        elif op in ["r", "reverse"]:
            modes = modes[2:3]
    res = controller.createPrivateMatch(modes=modes)
    return res


def handle_onLink():
    # print("Handling Link")
    return controller.getCurrentClash()


def handleBot():
    # create new async Loop for boot
    asyncio.set_event_loop(asyncio.new_event_loop())
    # loop = asyncio.get_event_loop()
    bot = Bot(TMI_TOKEN, CLIENT_ID, BOT_NICK, BOT_PREFIX, CHANNELS)
    bot.on_coc = handle_onCoc
    bot.on_link = handle_onLink
    bot.run()
    # loop.create_task(bot.start())


if __name__ == "__main__":
    app.run(debug=True)
