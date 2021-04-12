import os
import asyncio
from threading import Thread
from dotenv import load_dotenv
from functools import wraps
from flask import Flask, jsonify, request, make_response
from flask_caching import Cache
from bot import Bot
import controller

load_dotenv("./.env")
# credentials
TMI_TOKEN = os.environ.get('TMI_TOKEN')
CLIENT_ID = os.environ.get('CLIENT_ID')
BOT_NICK = os.environ.get('BOT_NICK')
BOT_PREFIX = os.environ.get('BOT_PREFIX')
CHANNELS = os.environ.get('CHANNEL').split(",")
EMAIL = os.environ.get('EMAIL')
PASSWORD = os.environ.get('PASSWORD')
ADMIN_USER = os.environ.get('ADMIN_USER')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASS')

app = Flask(__name__, static_folder="client/build", static_url_path='/')
app.config['CACHE_TYPE'] = "SimpleCache"
cache = Cache(app)

currents = {}

botThread = None
isBotReady = False
threadStarted = False


def authorize(f):
    @wraps(f)
    def decorated_function(*args, **kws):
        if request.authorization and request.authorization.username == ADMIN_USER and request.authorization.password == ADMIN_PASSWORD:
            return f(*args, **kws)
        else:
            return make_response('Could not verify!', 401, {'WWW-Authenticate': 'Basic realm="Login Required"'})
    return decorated_function


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


@app.route("/delete")
def deleteLocal():
    return app.send_static_file('index.html')


@ app.route('/start')
def startBot():
    global botThread
    if botThread is not None and isBotReady:
        return jsonify({"status": 200, "message": "Bot Running."})

    if botThread is None and not threadStarted:
        botThread = Thread(target=handleBot, daemon=True)
        botThread.start()
        controller.login(EMAIL, PASSWORD)

    return jsonify({"status": 202, "message": "Starting bot..."})


@ app.route("/api/report")  # Show Latest
@ app.route("/api/report/<matchId>")  # Show Specific
def getReport(matchId=None):
    report = controller.getReport(matchId)
    return jsonify({"status": 200 if report else 500, "message": report or "ERROR!!!"})


@ cache.memoize(timeout=5)
def getReportFromController(matchId):
    return controller.getReport(matchId)


@app.route("/view")
@authorize
def viewCurrent():
    return jsonify({"status": 200, "message": currents})


@ app.route("/set/<channleName>/<matchId>")
@authorize
def setManual(channleName, matchId):
    currents[channleName] = matchId
    return jsonify({"status": 200, "message": currents})


@ app.route("/api/<channleName>")
def getDetail(channleName):
    """
        return current Match detail
    """
    channleName = channleName.lower()
    if channleName == "" or channleName not in currents:
        return jsonify({"status": 404, "message": "Not Found!!!"})

    matchId = currents[channleName]
    report = getReportFromController(matchId)
    isStarted = report['started']

    ret = {"status": 200, "started": isStarted,
           "matchId": matchId,
           "noPlayers": len(report["players"])-1, "players": []}

    # if not even bot in lobby discard the match and send `409` i.e. conflict
    if ret['noPlayers'] < 0:
        # remove current match from currents list
        if channleName in currents:
            del currents[channleName]
        return jsonify({"status": 409, "message": "Found Empty Match!!"})

    if isStarted:
        ret['mode'] = report['mode']
        ret['msBeforeEnd'] = report['msBeforeEnd']
        ret['finished'] = report['finished']

    for player in report["players"]:
        # Don't Put bots data
        if player["codingamerNickname"] == "SkyCOCBot":
            continue

        pInfo = {
            "name": player['codingamerNickname'],
            "avatarId": player.get('codingamerAvatarId', None)
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
    chName = ctx.channel.name.lower()  # name of the channel used as key in dict
    matchId = currents.get(chName, None)    # current MatchId if any
    print("INFO|", chName)
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
    global threadStarted
    if threadStarted:
        print("ERROR|", "Bot Already Running")
        return
    # create new async Loop for boot
    asyncio.set_event_loop(asyncio.new_event_loop())
    # loop = asyncio.get_event_loop()
    bot = Bot(TMI_TOKEN, CLIENT_ID, BOT_NICK, BOT_PREFIX, CHANNELS)
    bot.on_ready = handle_onBotReady
    bot.on_coc = handle_onCoc
    bot.on_link = handle_onLink
    threadStarted = True
    bot.run()
    # loop.create_task(bot.start())


if __name__ == "__main__":
    app.run()
