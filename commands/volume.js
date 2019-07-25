const { RichEmbed } = require("discord.js");

exports.run = async (client, msg, args, color) => {
    const serverQueue = client.queue.get(msg.guild.id);
    let volume = args[0];

    if (!msg.member.voiceChannel) return msg.reply('kamu sedang tidak berada di voice channel').then(msg=>msg.delete(5000));
    if (!serverQueue) return msg.reply('tidak ada lagu yang sedang dimainkan').then(msg=>msg.delete(5000));
    if (!volume) return msg.channel.send(`Volume saat ini adalah: **${serverQueue.volume}**`);
    if (volume > 100) return msg.channel.send('Maksimal volume adalah 100');
    serverQueue.connection.dispatcher.setVolumeLogarithmic(volume / 100);

    let embed = new RichEmbed()
    .setDescription(`Volume diganti menjadi: **${volume}**`)
    .setColor(color)
    msg.channel.send(embed);
}

exports.help = {
    name: "volume",
    aliases: ["vol"],
    description: "Ganti volume musik yang dimainkan",
    usage: "volume 1-100"
}
