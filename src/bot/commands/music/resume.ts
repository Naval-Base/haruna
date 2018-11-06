import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class ResumeCommand extends Command {
	public constructor() {
		super('resume', {
			aliases: ['resume'],
			description: {
				content: 'Resumes the queue.'
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
		await queue.player.pause(false);

		return message.util!.send('Resumed the queue.');
	}
}
