import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class ShuffleCommand extends Command {
	public constructor() {
		super('shuffle', {
			aliases: ['shuffle', '🔀'],
			description: {
				content: 'Shuffles the queue.',
			},
			category: 'music',
			channel: 'guild',
			ratelimit: 2,
		});
	}

	public async exec(message: Message) {
		if (!message.member!.voice || !message.member!.voice.channel) {
			return message.util!.reply('you have to be in a voice channel first, silly.');
		}
		const queue = this.client.music.queues.get(message.guild!.id);
		await queue.shuffle();

		return message.util!.send('Shuffled the queue.');
	}
}
