from twitchio.ext import commands


class Bot(commands.Bot):

    def __init__(self, tmi_token, client_id, nick, prefix, channel):
        """Create a Twitchio bot with given parameters

        Args:
            tmi_token (str): TMI token from `https://twitchapps.com/tmi/`
            client_id (str): Client ID of registerd app
            nick (str): Nick Name of the bot
            prefix (str): Prefix for commands
            channel (list[str]): Channels to listen messages from
        """
        super().__init__(irc_token=tmi_token,
                         client_id=client_id,
                         nick=nick,
                         prefix=prefix,
                         initial_channels=channel)

        self.on_coc = None
        self.on_link = None
        self.on_ready = None

    async def event_ready(self):
        """Event invoked when bot is ready and listening to messages from specified channels"""
        print(f'Ready | {self.nick}  listening to ', self.initial_channels)

        if self.on_ready is not None:
            self.on_ready()

    @ commands.command(name='coc')
    async def my_command(self, ctx):
        if not ctx.author.is_mod:
            await ctx.send("Sorry only Mods are allowed!!!")
            return

        if self.on_coc is not None:
            res = self.on_coc(ctx)
            await ctx.send(res)

    @ commands.command(name="link", aliases=["l"])
    async def onGetLink(self, ctx):
        if self.on_link is not None:
            res = self.on_link(ctx)
            await ctx.send(res)

    @ commands.command(name="help")
    async def onHelp(self, ctx):
        await ctx.send("""`!coc reset | c[ancel]` Cancels current Lobby \n
                            `!coc` Create or Start Current lobby \n 
                            `!coc f[ast[est]]]` Create match with Fastest Mode\n
                            `!coc s[hort[est]]]` Create match with Shortest Mode\n
                            `!coc r[evers]` Create match with Reverse Mode\n
                            `!l[ink] gives link of current lobby`""")
