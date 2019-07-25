const { RichEmbed } = require("discord.js");
const { YT_KEY } = process.env;
const ytdl = require("ytdl-core");
const Youtube = require("simple-youtube-api");

const youtube = new Youtube(YT_KEY);

exports.run = async (client, msg, args, color) => {
    const searchString = args.join(' ');
    const url = args[0] ? args[0].replace(/<(.+)>/g, '$1') : '';

    const voiceChannel = msg.member.voiceChannel;
    if (!voiceChannel) return msg.channel.send(`Kamu harus berada di voice channel untuk memainkan musik!`).then(msg=>msg.delete(5000));
    const permissions = voiceChannel.permissionsFor(client.user);
    if (!permissions.has('CONNECT')) return msg.channel.send(`Aku tidak bisa terhubung ke voice channel, pastikan aku memiliki \`CONNECT\` permission!`).then(msg=>msg.delete(5000));
    if (!permissions.has('SPEAK')) return msg.channel.send(`Aku tidak bisa bicara di channel ini, pastikan aku memiliki \`SPEAK\` permission!`).then(msg=>msg.delete(5000));

    if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
        const playlist = await youtube.getPlaylist(url);
        const videos = await playlist.getVideos();
        for (const Videos of Object.values(videos)) {
            const video = await youtube.getVideoByID(Videos.id);
            await handleVideo(video, msg, voiceChannel, true);
        }
        return msg.channel.send(`✅ Playlist: **${playlist.title}** ditambahkan ke antrian!`)
    } else {
        try {
            var video = await youtube.getVideo(url);
        } catch (err) {
            try {
                var videos = await youtube.searchVideos(searchString, 10);

                const embed = new RichEmbed()
                .setTitle(":musical_note: Song Selection :musical_note:")
                .setDescription(videos.map((x, i) => `**${i+1} -** ${x.title}`).join('\n'))
                .setColor(color)
                .setFooter("Silahkan pilih lagu di atas dengan menjawab angkanya saja 1-10")
                let msgtoDelete = await msg.channel.send(embed);
                try {
                    var response = await msg.channel.awaitMessages(m => m.content > 0 && m.content < 11, {
                        maxMatches: 1,
                        time: 10000,
                        errors: ['time']
                    });
                    msgtoDelete.delete();
                } catch (err) {
                    console.error(err);
                    const noPick = new RichEmbed()
                    .setDescription("Tidak ada atau salah input, membatalkan memilih vide.")
                    .setColor(color)
                    msg.channel.send(noPick);
                    return msgtoDelete.delete();
                }
                const videoIndex = parseInt(response.first().content);
                var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
            } catch (err) {
                console.error(err);
                return msg.chanel.send('Aku tidak bisa mencari apa-apa');
            }
        }
        return handleVideo(video, msg, voiceChannel)
    }

    async function handleVideo(video, msg, voiceChannel, playlist = false) {
        const serverQueue = client.queue.get(msg.guild.id);
        const song = {
            id: video.id,
            title: video.title,
            url: `https://www.youtube.com/watch?v=${video.id}`,
            thumbnail: video.thumbnails.default.url,
            durationH: video.duration.hours,
            durationM: video.duration.minutes,
            durationS: video.duration.seconds,
            channelName: voiceChannel.name,
            listener: msg.author
        }
        // console.log(video);
        if (!serverQueue) {
            const queueConstruct = {
                textChannel: msg.channel,
                voiceChannel: voiceChannel,
                connection: null,
                skippers: [],
                songs: [],
                volume: 100,
                playing: true
            }
            client.queue.set(msg.guild.id, queueConstruct);
            queueConstruct.songs.push(song);

            try {
                var connection = await voiceChannel.join();
                queueConstruct.connection = connection;
                play(msg.guild, queueConstruct.songs[0]);
            } catch (err) {
                console.error(err);
                client.queue.delete(msg.guild.id);
                return msg.channel.send(`Aku tidak bisa terhubung ke voice channel: ${err}`);
            }
        } else {
            serverQueue.songs.push(song);
            if (playlist) return undefined;
            else return msg.channel.send(`✅ Playlist: **${song.title}** ditambahkan ke antrian!`)
        }
        return undefined;
    }

    function play(guild, song) {
        const serverQueue = client.queue.get(msg.guild.id);
        if (!song) {
            serverQueue.voiceChannel.leave();
            return client.queue.delete(guild.id);
        }
        const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
            .on('end', reason => {
                if (reason === 'Stream is not generating quickly enough.') console.log(`Song ended at ${guild.name}`);
                else console.log(reason);
                let shiffed = serverQueue.songs.shift();
                if (serverQueue.loop) serverQueue.songs.push(shiffed);
                return play(guild, serverQueue.songs[0]);
            })
            .on('error', error => console.error(error));
        dispatcher.setVolumeLogarithmic(serverQueue.volume / 100);

        const playembed = new RichEmbed()
        .setColor(color)
        .setAuthor(`Start Playing`, `https://images-ext-1.discordapp.net/external/YwuJ9J-4k1AUUv7bj8OMqVQNz1XrJncu4j8q-o7Cw5M/http/icons.iconarchive.com/icons/dakirby309/simply-styled/256/YouTube-icon.png`)
        .setThumbnail(song.thumbnail)
        .addField('Title', `__[${song.title}](${song.url})__`)
        .addField('Video ID', `${song.id}`, true)
        .addField("Volume", `${serverQueue.volume}%`, true)
        .addField("Duration", `${song.durationH}H ${song.durationM}M ${song.durationS}S`, true)
        .addField('Voice Channel', `**${song.channelName}**`, true)
        .addField('Requested by', `${song.listener}`, true)
        .setFooter("If you can't hear the music, please reconnect. If you still can't hear maybe the bot is restarting!")
        .setTimestamp();
      
        return serverQueue.textChannel.send(playembed);
    }
}

exports.help = {
    name: "play",
    aliases: ["p"],
    description: "Mainkan musik menggunakan bot",
    usage: "play <youtube link> <judul video>",
    cooldown: "7"
}
