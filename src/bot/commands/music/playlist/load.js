const { Command } = require('discord-akairo');

class PlaylistLoadCommand extends Command {
	constructor() {
		super('playlist-load', {
			description: {
				content: 'Lodas a playlist into the queue.',
				usage: '<playlist>',
				examples: []
			},
			category: 'music',
			channel: 'guild',
			ratelimit: 2,
			args: [
				{
					id: 'playlist',
					match: 'content',
					type: 'playlist',
					prompt: {
						start: message => `${message.author}, what playlist should be played?`,
						retry: (message, _, provided) => `${message.author}, a playlist with the name **${provided.phrase}** does not exist.`
					}
				}
			]
		});
	}

	async exec(message, { playlist }) {
		if (!message.member.voice || !message.member.voice.channel) {
			return message.util.reply('You have to be in a voice channel first, silly.');
		} else if (!message.member.voice.channel.joinable) {
			return message.util.reply("I don't seem to have permission to enter this voice channel.");
		} else if (!message.member.voice.channel.speakable) {
			return message.util.send("I don't seem to have permission to talk in this voice channel.");
		}
		const user = await this.client.users.fetch(playlist.user);
		const queue = this.client.music.queues.get(message.guild.id);
		if (!message.guild.me.voice.channel) await queue.player.join(message.member.voice.channel.id);
		await queue.add(...playlist.songs);
		if (!queue.player.playing && !queue.player.paused) await queue.start();

		return message.util.send(`${this.client.emojis.get('479430354759843841')} **Queued up:** \`${playlist.name}\` from ${user.tag}`);
	}
}

module.exports = PlaylistLoadCommand;
