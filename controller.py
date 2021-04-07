import requests

session = requests.Session()
myId = None
matchId = None


def login(username, password):
    global myId
    loginURL = "https://www.codingame.com/services/Codingamer/loginSiteV2"
    jsonData = ["netvisiorscs@gmail.com", "mypassword", "true"]
    res = session.post(loginURL, json=jsonData)
    if res.status_code != 200:
        print("ERROR while login!!")
        return

    data = res.json()
    myId = data['codinGamer']['userId']


def createPrivateMatch(modes=["FASTEST", "SHORTEST", "REVERSE"], languages=[]):
    global myId, matchId
    if myId is None:
        print("ERROR Not logged in")
        return "Not Logged In!!!"
    url = "https://www.codingame.com/services/ClashOfCode/createPrivateClash"
    jsonData = [myId, {"SHORT": "true"}, languages, modes]
    res = session.post(url, json=jsonData)
    if res.status_code != 200:
        print("ERROR while Creating Private Match")
        return "Error while creating private match"

    data = res.json()
    print(data)
    matchId = data['publicHandle']
    print(f"https://www.codingame.com/clashofcode/clash/{matchId}")


def startMatch():
    if myId is None or matchId is None:
        print("ERROR ")
        return "Error While Starting!!!"

    url = "https://www.codingame.com/services/ClashOfCode/startClashByHandle"
    jsonData = [myId, matchId]
    res = session.post(url, json=jsonData)
    print("STATUS of Start", res.status_code)
    return res.status_code


def getReport():
    if myId is None or matchId is None:
        print("ERROR")
        return "Error"

    url = "https://www.codingame.com/services/ClashOfCode/findClashReportInfoByHandle"
    jsonData = [matchId]
    res = session.post(url, json=jsonData)
    print("STATUS of Report", res.status_code)
    data = res.json()
    print("DATA", data)
    # print(len(data['players']))


login("netvisiorscs@gmail.com", "mypassword")
createPrivateMatch()
input("Enter to start Match..")
startMatch()
t = "n"
while t != "q":
    t = input("Enter to get Report...\n")
    getReport()

print("Ended")
# fetch("https://www.codingame.com/services/Codingamer/loginSiteV2", {
#     "headers": {
#       "accept": "application/json, text/plain, */*",
#       "content-type": "application/json;charset=UTF-8"
#       },
#     "referrer": "https://www.codingame.com/reset-password/426534049d31d7d4763afd876885968bd9e6e31",
#     "referrerPolicy": "strict-origin-when-cross-origin",
#     "body": "[\"netvisiorscs@gmail.com\",\"mypassword\",true]",
#     "method": "POST",
#     "mode": "cors",
#     "credentials": "omit"
# })
