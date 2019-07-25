require("dotenv").config();
const { Client, Collection } = require("discord.js");
const { readdirSync } = require("fs");
const client = new Client({
    fetchAllMembers: true,
    disabledEvents: [
        "GUILD_SYNC",
        "PRESENCE_UPDATE",
        "TYPING_START"
    ]
});

const { COLOR, TOKEN, PREFIX } = process.env;
const cooldowns = new Collection();

client.queue = new Collection();
client.commands = new Collection();
client.aliases = new Collection();

// Commands Loader
for (const command of readdirSync('./commands').filter(x => x.endsWith(".js"))) {
    let cmd = require(`./commands/${command}`);
    client.commands.set(cmd.help.name.toLowerCase(), cmd);
    for (const alias of cmd.help.aliases) {
        client.aliases.set(alias.toLowerCase(), cmd.help.name.toLowerCase());
    }
}

// Client Events
client.on("ready", async () => {
    client.user.setActivity('In coding');
    console.log(`[READY] Bot has login with Username: ${client.user.username}, ID: ${client.user.id}`);
});

client.on("message", async (msg) => {
    if (msg.author.bot || !msg.guild) return;

    let prefix = PREFIX;
    let color = COLOR;
    let args = msg.content.slice(prefix.length).trim().split(/ +/g);
    let command = args.shift().toLowerCase();
    let re = new RegExp(`<@!?${client.user.id}>`);

    if (re.test(msg.content)) return msg.channel.send(`Prefix is \`${prefix}\``);
    if (!msg.content.toLowerCase().startsWith(prefix)) return;

    let cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command));
    if (!cmd) return;
    if (!cooldowns.has(cmd.help.name)) cooldowns.set(cmd.help.name, new Collection());

    let now = Date.now();
    let timestamp = cooldowns.get(cmd.help.name) || new Collection();
    let cooldown = cmd.help.cooldown || 5;
    let usercool = timestamp.get(msg.author.id) || 0;
    let estimated = usercool + (cooldown * 1000) - now;

    if (usercool && estimated > 0) {
        return msg.channel.send(`**${msg.author.username}**, kamu harus menunggu **${(estimated/1000).toFixed()} detik** untuk menggunakan perintah yang sama.`).then(msg=>msg.delete(5000));
    }

    timestamp.set(msg.author.id, now);
    cooldowns.set(cmd.help.name, timestamp);
    cmd.run(client, msg, args, color);
});

client.login(TOKEN);
