const { RichEmbed } = require("discord.js");

exports.run = async (client, msg, args, color) => {
    const serverQueue = client.queue.get(msg.guild.id);

    if (serverQueue && serverQueue.playing) {
        serverQueue.playing = false;
        serverQueue.connection.dispatcher.pause();
        let embed = new RichEmbed()
        .setDescription('⏸ Mem-pause musik yang sedang dimainkan!')
        .setColor(color)
		 	  return msg.channel.send(embed);
    }
        
	  return msg.channel.send('Tidak ada musik yang sedang dimainkan.');
}

exports.help = {
    name: "pause",
    aliases: [],
    description: "Mem-pause musik yang sedang dimainkan",
    usage: "pause"
}
