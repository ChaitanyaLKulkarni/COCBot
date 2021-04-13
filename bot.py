from twitchio.ext import commands


class Bot(commands.Bot):

    def __init__(self, tmi_token, client_id, nick, prefix, channel, comms):
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
        self.on_addCommand = None
        self.comms = comms

    async def event_ready(self):
        """Event invoked when bot is ready and listening to messages from specified channels"""
        print(f'Ready | {self.nick}  listening to ', self.initial_channels)

        if self.on_ready is not None:
            self.on_ready()

    async def event_command_error(self, ctx, err):
        com = ctx.message.content.split(" ")[0][1:].lower()
        chName = ctx.channel.name.lower()
        op = self.comms.get(chName, {}).get(com)
        if op:
            await ctx.send(op)

    @ commands.command(name='add', aliases=['set'])
    async def addCommand(self, ctx):
        if not ctx.author.is_mod:
            return
        chName = ctx.channel.name.lower()
        if chName not in self.comms:
            self.comms[chName] = {}
        msg = ctx.message.content.split(" ")
        if len(msg) < 3:
            await ctx.send("Wrong! Usage: !add <command> <response>")
            return

        _, com, *op = msg
        com = com.lower()
        op = " ".join(op)
        self.comms[chName][com] = op
        if self.on_addCommand:
            self.on_addCommand(chName, com, op)
        await ctx.send("Successfully added command: "+com)

    @ commands.command(name='remove', aliases=['reset'])
    async def removeCommand(self, ctx):
        if not ctx.author.is_mod:
            return
        chName = ctx.channel.name.lower()
        com = ctx.message.content.split(" ")[1]
        com = com.lower()
        if chName not in self.comms or com not in self.comms.get(chName, {}):
            await ctx.send("No Command Found to remove!")
            return

        del self.comms[chName]
        if self.on_removeCommand:
            self.on_removeCommand(chName, com)
        await ctx.send("Successfully removed command: "+com)

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
        modCommands = """Manage Commands: || 
                        !add | !set <command> <response> : After that !<command> will send back <response> || 
                        !remove | !reset <command> : deletes the <command>"""

        if ctx.author.is_mod:
            await ctx.send(modCommands)
        op = """COC Bot: !coc : reset | c[ancel] Cancels current Lobby || 
                !coc : Create new lobby, optional parameters to set Mode: f[astest] s[hortest] r[everse] || 
                !coc : Start current lobby if any and has not been Started || 
                !l[ink] : gives link of current lobby """
        await ctx.send(op)
