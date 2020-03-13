const { RichEmbed } = require("discord.js");

exports.run = async (client, message, args, color) => {
  const serverQueue = client.queue.get(message.guild.id);

  if (!message.member.voiceChannel)
    return message.channel.send("You must join voice channel first");
  if (serverQueue.voiceChannel.id !== message.member.voiceChannel.id)
    return message.channel.send(
      `You must be in **${serverQueue.voiceChannel.name}** to loop the queue`
    );
  if (!serverQueue)
    return message.channel.send(
      "Are you sure? nothing to loop because queue is empty"
    );

  const loop = new RichEmbed()
    .setDescription("🔁 **Enable**")
    .setColor("GREEN");
  const unloop = new RichEmbed()
    .setDescription("🔁 **Disable**")
    .setColor("RED");
  serverQueue.loop = !serverQueue.loop;
  if (serverQueue.loop) return message.channel.send(loop);
  return message.channel.send(unloop);
};

exports.conf = {
  aliases: []
};

exports.help = {
  name: "loop"
};
