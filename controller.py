from logging import getLogger
import re
import requests
import json

session = requests.Session()
myId = None


def login(username, password):
    global myId
    if myId is not None:
        print("Already logged in")
    loginURL = "https://www.codingame.com/services/Codingamer/loginSiteV2"
    jsonData = [username, password, "true"]
    res = session.post(loginURL, json=jsonData)
    if res.status_code != 200:
        print("ERROR while login!!")
        return

    data = res.json()
    myId = data['codinGamer']['userId']


def createPrivateMatch(modes=["FASTEST", "SHORTEST", "REVERSE"], languages=[]):
    global myId
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
    # print(data)
    matchId = data['publicHandle']
    return f"Join Clash: https://www.codingame.com/clashofcode/clash/{matchId}"


def getCurrentClash(mid=None):
    if mid is None:
        return "No Clash Running!!!"

    return f"Join Clash: https://www.codingame.com/clashofcode/clash/{mid}"


def startMatch(mid=None):
    if mid is None:
        if myId is None:
            print("ERROR ")
            return "Error While Starting!!!"

    url = "https://www.codingame.com/services/ClashOfCode/startClashByHandle"
    jsonData = [myId, mid]
    res = session.post(url, json=jsonData)
    print("STATUS of Start", res.status_code)
    return res.status_code


def getReport(mid=None):
    if mid is None:
        if myId is None:
            print("ERROR While getting Report!!")
            return None

    url = "https://www.codingame.com/services/ClashOfCode/findClashReportInfoByHandle"
    jsonData = [mid]
    res = session.post(url, json=jsonData)
    # print("STATUS of Report", res.status_code)
    data = res.json()
    # with open("f.json", "w") as f:
    #     json.dump(data, f)
    # print("DATA", data)
    return data
    # print(len(data['players']))


def leaveCurrentClash(mid=None):
    if mid is None:
        print("ERROR Match not Set")
        return False

    url = "https://www.codingame.com/services/ClashOfCode/leaveClashByHandle"
    jsonData = [myId, mid]
    res = session.post(url, json=jsonData)
    # print("STATUS of Report", res.status_code)
    if res.status_code == 204:
        return True
