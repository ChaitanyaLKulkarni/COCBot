import os
# from pathlib import Path
from dotenv import load_dotenv
# from os.path import join, dirname
from twitchio.ext import commands

load_dotenv("./.env")

# credentials
TMI_TOKEN = os.environ.get('TMI_TOKEN')
CLIENT_ID = os.environ.get('CLIENT_ID')
BOT_NICK = os.environ.get('BOT_NICK')
BOT_PREFIX = os.environ.get('BOT_PREFIX')
CHANNEL = os.environ.get('CHANNEL').split("\s")


class Bot(commands.Bot):

    __instance = None

    @staticmethod
    def getInstance():
        """ Static access method. """
        if Bot.__instance == None:
            Bot()
        return Bot.__instance

    def __init__(self, tmi_token=TMI_TOKEN, client_id=CLIENT_ID, nick=BOT_NICK, prefix=BOT_PREFIX, channel=CHANNEL):
        if Bot.__instance != None:
            raise Exception("This class is a singleton!")
        else:
            Bot.__instance = self

        super().__init__(irc_token=tmi_token,
                         client_id=client_id,
                         nick=nick,
                         prefix=prefix,
                         initial_channels=channel)

        self.on_coc = None
        self.on_link = None

    async def event_ready(self):
        print(f'Ready | {self.nick}  listening to ', CHANNEL)

    @commands.command(name='coc')
    async def my_command(self, ctx):
        if not ctx.author.is_mod:
            await ctx.send("Sorry only Mods are allowed!!!")
            return

        if self.on_coc:
            res = self.on_coc(ctx)
            await ctx.send(res)

    @commands.command(name="link", aliases=["l"])
    async def onGetLink(self, ctx):
        if self.on_link:
            res = self.on_link(ctx)
            await ctx.send(res)


if __name__ == "__main__":
    # launch bot
    bot = Bot.getInstance()
    bot.run()
