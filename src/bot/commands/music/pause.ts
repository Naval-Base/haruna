import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class PauseCommand extends Command {
	public constructor() {
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

	public async exec(message: Message) {
		if (!message.member.voice || !message.member.voice.channel) {
			return message.util!.reply('You have to be in a voice channel first, silly.');
		}
		const queue = this.client.music.queues.get(message.guild.id);
		await queue.player.pause();

		return message.util!.send('Paused the queue.');
	}
}
