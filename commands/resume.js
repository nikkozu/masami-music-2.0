const { RichEmbed } = require("discord.js");

exports.run = async (client, msg, args, color) => {
    const serverQueue = client.queue.get(msg.guild.id);

    if (serverQueue && !serverQueue.playing) {
        serverQueue.playing = true;
        serverQueue.connection.dispatcher.resume();
        let embed = new RichEmbed()
        .setDescription(':arrow_forward: Memulai lagi musik yang di pause!')
        .setColor(color)
			  return msg.channel.send(embed);
    }
        
	  return msg.channel.send('Tidak ada musik yang sedang di pause.');
}

exports.help = {
    name: "resume",
    aliases: [],
    description: "Memulai lagi musik yang di pause",
    usage: "resume"
}
