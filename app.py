import os
import asyncio
from threading import Thread
from dotenv import load_dotenv
from flask import Flask, jsonify, render_template
from flask_caching import Cache
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

cache = Cache(config={'CACHE_TYPE': 'SimpleCache'})

app = Flask(__name__, static_folder="client/build", static_url_path='/')
cache.init_app(app)

currents = {}

botThread = None
isBotReady = False


@ app.route('/')
def index():
    return app.send_static_file('index.html')


@ app.route("/web/<channleName>")
def getChannelView(channleName):
    """
        return the template with the channel name
        in js store data locally
    """
    return app.send_static_file('index.html')


@ app.route('/start')
def startBot():
    global botThread
    if botThread is not None and isBotReady:
        return jsonify({"status": 200, "message": "Bot Running."})

    if botThread is None:
        botThread = Thread(target=handleBot, daemon=True)
        botThread.start()
        controller.login(EMAIL, PASSWORD)

    return jsonify({"status": 202, "message": "Starting bot..."})


@ app.route("/api/report")  # Show Latest
@ app.route("/api/report/<matchId>")  # Show Specific
def getReport(matchId=None):
    report = controller.getReport(matchId)
    return jsonify({"status": 200 if report else 500, "message": report or "ERROR!!!"})


@ app.route("/api/<channleName>")
@ cache.memoize(timeout=5)
def getDetail(channleName):
    """
        return current Match detail
    """
    print("GEtting...")
    if channleName not in currents:
        return jsonify({"status": 404, "message": "Not Found!!!"})

    matchId = currents[channleName]
    report = controller.getReport(matchId)
    isStarted = report['started']

    ret = {"status": 200, "started": isStarted,
           "matchId": matchId,
           "noPlayers": len(report["players"])-1, "players": []}
    if isStarted:
        ret['mode'] = report['mode']
        ret['msBeforeEnd'] = report['msBeforeEnd']
        ret['finished'] = report['finished']

    for player in report["players"]:
        # Don't Put bots data
        if player["codingamerNickname"] == "SkyCOCBot":
            continue

        pInfo = {
            "name": player['codingamerNickname']
        }

        if isStarted:
            isCompleted = player['testSessionStatus'] == "COMPLETED"
            pInfo["finished"] = isCompleted

            if isCompleted:
                pInfo['rank'] = player['rank']
                pInfo['duration'] = player['duration']
                pInfo['language'] = player['languageId']

        ret["players"].append(pInfo)

    return jsonify(ret)


def handle_onBotReady():
    global isBotReady
    isBotReady = True


def handle_onCoc(ctx):
    """Handle COC command that only works if called by Mod

    Args:
        ctx (Contex): Contex

    Returns:
        str: String to send back to Chat
    """
    msg = ctx.message.content  # message
    options = msg.split()   # split msg to find any options
    chName = ctx.channel.name  # name of the channel used as key in dict
    matchId = currents.get(chName, None)    # current MatchId if any

    if len(options) == 2:
        # Check if `reset` or `cancle` or 'c' flag is set
        if options[1].lower() in ["reset", "cancle", "c"]:
            # if no match is running
            if chName not in currents:
                return "No Clash Running to cancle!!"

            # Remove from DB and leave that match
            controller.leaveCurrentClash(matchId)
            if chName in currents:
                del currents[chName]

            return "Current Clashed Cancled!!! "

    # if already match exits Start if not Started
    if chName in currents:
        data = controller.getReport(matchId)
        if data['started'] == False:
            controller.startMatch(matchId)
            return f"Starting with {str(len(data['players']) - 1)} Players"

    # Create New Match if No Match or Match was already started
    # get modes from options
    modes = ["FASTEST", "SHORTEST", "REVERSE"]
    selectedModes = []
    if len(options) == 2:
        ops = [o.lower() for o in options[1:]]  # get options
        for op in ops:
            if op in ["f", "fast", "fastest"]:
                selectedModes.append(modes[0])
            elif op in ["s", "short", "shortest"]:
                selectedModes.append(modes[1])
            elif op in ["r", "reverse"]:
                selectedModes.append(modes[2])

    # if no mode selected then set to default
    if len(selectedModes) == 0:
        selectedModes = modes
    # create Private looby
    res = controller.createPrivateMatch(modes=selectedModes)
    currents[chName] = res.split("/")[-1]
    return res


def handle_onLink(ctx):
    return controller.getCurrentClash(currents.get(ctx.channel.name, None))


def handleBot():
    # create new async Loop for boot
    asyncio.set_event_loop(asyncio.new_event_loop())
    # loop = asyncio.get_event_loop()
    bot = Bot(TMI_TOKEN, CLIENT_ID, BOT_NICK, BOT_PREFIX, CHANNELS)
    bot.on_ready = handle_onBotReady
    bot.on_coc = handle_onCoc
    bot.on_link = handle_onLink
    bot.run()
    # loop.create_task(bot.start())


if __name__ == "__main__":
    app.run()
