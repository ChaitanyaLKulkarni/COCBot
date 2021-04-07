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


def handle_onCoc():
    """Handle COC command that only works if called by Mod

    Args:
        ctx (Contex): Contex 

    Returns:
        str: String to send back to Chat
    """
    # print("Handling Coc ")

    return "handled coc"


def handle_onLink():
    # print("Handling Link")
    return "handled link"


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
