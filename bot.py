from twitchio.ext import commands


class Bot(commands.Bot):

    def __init__(self, tmi_token, client_id, nick, prefix, channel):
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
            res = self.on_coc()
            await ctx.send(res)

    @commands.command(name="link", aliases=["l"])
    async def onGetLink(self, ctx):
        if self.on_link:
            res = self.on_link()
            await ctx.send(res)


if __name__ == "__main__":
    # launch bot
    bot = Bot.getInstance()
    bot.run()
