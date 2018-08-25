const { Command } = require('discord-akairo');

class PauseCommand extends Command {
	constructor() {
		super('pause', {
			aliases: ['pause'],
			description: {
				content: 'Pauses the queue.'
			},
			category: 'music',
			channel: 'guild',
			ratelimit: 2
		});
	}

	async exec(message) {
		if (!message.member.voice || !message.member.voice.channel) {
			return message.util.reply('You have to be in a voice channel first, silly.');
		}
		const queue = this.client.music.queues.get(message.guild.id);
		await queue.player.pause();

		return message.util.send('Paused the queue.');
	}
}

module.exports = PauseCommand;
