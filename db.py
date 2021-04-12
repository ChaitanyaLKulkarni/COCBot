import pymongo
from pprint import pprint


class DB:
    def __init__(self, username, password, database="bot"):
        client = pymongo.MongoClient(
            f"mongodb+srv://{username}:{password}@cluster0.lduex.mongodb.net/{database}?retryWrites=true&w=majority")
        self.db = client[database]
        self.matches = self.db['matches']
        self.commands = self.db['commads']

    def getAll(self):
        op = []
        for m in self.matches.find({}):
            op.append(m)
        return op

    def getMatchInfo(self, channelName):
        """Gets detail of matches from DB

        Args:
            channelName (str): name of channel to get matches of 

        Returns:
            dict | None: data of that channel or None if not found.
        """
        return self.matches.find_one({"_id": channelName})

    def addNewMatch(self, channelName, matchId):
        """Adds new match to current and pushes current to prev matches

        Args:
            channelName (str): channelName
            matchId (str): new match ID
        """
        chObj = self.getMatchInfo(channelName)
        if chObj is None:
            chObj = {"_id": channelName,
                     "currentMatch": matchId, "prevMatches": []}
            return self.matches.insert_one(chObj)
            # print("Created")
        else:
            prev = chObj["prevMatches"]
            if(chObj["currentMatch"] != ""):
                prev.insert(0, chObj["currentMatch"])
            return self.matches.update_one({"_id": channelName}, {"$set": {
                "currentMatch": matchId, "prevMatches": prev}})
            # print("Updated")

    def cancleMatch(self, channelName):
        """Removes currentMatch i.e. set to "" 

        Args:
            channelName (str): channelName
        """
        chObj = self.getMatchInfo(channelName)
        if chObj is None:
            print("No Channel Found!!")
        else:
            self.matches.update_one({"_id": channelName}, {"$set": {
                                    "currentMatch": ""}})
            print("Cancled")
