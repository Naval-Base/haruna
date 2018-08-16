const { Command } = require('discord-akairo');

class RemoveCommand extends Command {
	constructor() {
		super('remove', {
			aliases: ['remove'],
			description: {
				content: 'Removes a song from the queue.',
				usage: '[number]',
				examples: ['remove 3', 'remove 6']
			},
			category: 'music',
			channel: 'guild',
			ratelimit: 2,
			args: [
				{
					id: 'number',
					match: 'content',
					type: 'number'
				}
			]
		});
	}

	async exec(message, { number }) {
		if (!message.member.voice || !message.member.voice.channel) {
			return message.util.reply('You have to be in a voice channel first, silly.');
		}
		const tracks = await this.client.music.queues.redis.lrange(`playlists.${message.guild.id}`, 0, -1);
		number = number >= 1 ? number - 1 : tracks.length - (~number + 1);
		const decoded = await this.client.music.decode([tracks[number]]);
		await this.client.music.queues.redis.lrem(`playlists.${message.guild.id}`, 1, tracks[number]);

		return message.util.send(`${this.client.emojis.get('479430354759843841')} **Removed:** \`${decoded[0].info.title}\``);
	}
}

module.exports = RemoveCommand;
