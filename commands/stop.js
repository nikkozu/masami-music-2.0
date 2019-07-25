exports.run = async (client, msg, args, color) => {
    const serverQueue = client.queue.get(msg.guild.id);

    if (!msg.member.voiceChannel) return msg.reply('kamu sedang tidak berada di voice channel').then(msg=>msg.delete(5000));
    if (!serverQueue) return msg.reply('tidak ada lagu yang sedang dimainkan').then(msg=>msg.delete(5000));
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end(`Stop command has been used at ${msg.guild.name}`);
    msg.channel.send(":stop_button: Meberhentikan musik!");
}

exports.help = {
    name: "stop",
    aliases: [],
    description: "Memberhentikan semua musik yang sedang dimainkan",
    usage: "stop"
}
