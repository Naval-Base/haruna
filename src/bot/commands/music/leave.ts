import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { SETTINGS } from '../../../util/constants';

export default class LeaveCommand extends Command {
	public constructor() {
		super('leave', {
			aliases: ['leave', '🚪'],
			description: {
				content: 'Leaves the voice channel (`--clear` to clear the queue before leaving)',
				usage: '[--clear/-c]',
				examples: ['--clear', '-c'],
			},
			category: 'music',
			channel: 'guild',
			ratelimit: 2,
			args: [
				{
					id: 'clear',
					match: 'flag',
					flag: ['--clear', '-c'],
				},
			],
		});
	}

	public async exec(message: Message, { clear }: { clear: boolean }) {
		if (!message.member?.voice?.channel) {
			return message.util!.reply('you have to be in a voice channel first, silly.');
		}
		const DJ = message.member.roles.has(this.client.settings.get(message.guild!, SETTINGS.DJ));
		const queue = this.client.music.queues.get(message.guild!.id);
		if (clear && DJ) await queue.clear();
		await queue.stop();
		await queue.player.destroy();
		if (message.guild?.me?.voice.channel) await queue.player.leave();

		return message.util!.send('👋');
	}
}
