const { RichEmbed } = require("discord.js");

exports.run = async (client, msg, args, color) => {
    const serverQueue = client.queue.get(msg.guild.id);

    if (!serverQueue) return message.channel.send('There is nothing playing! Add some music to play using: play [song-name]');
    
    const queueInfo = new Discord.RichEmbed()
    .setTitle("Song Queue")
    .setDescription(`${serverQueue.songs.map(song => `**-** ${song.title}`).slice(0, 16).join('\n')}`)
    .setFooter("Currently Playing: " + serverQueue.songs[0].title)
    .setColor(color)
    
    return message.channel.send(queueInfo);
}

exports.help = {
    name: "resume",
    aliases: [],
    description: "Memulai lagi musik yang di pause",
    usage: "resume"
}
