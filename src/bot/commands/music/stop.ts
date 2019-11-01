import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { SETTINGS } from '../../../util/constants';

export default class StopCommand extends Command {
	public constructor() {
		super('stop', {
			aliases: ['stop', '🛑', '⏹'],
			description: {
				content: 'Stops and clears the queue.',
			},
			category: 'music',
			channel: 'guild',
			ratelimit: 2,
		});
	}

	public async exec(message: Message) {
		if (!message.member?.voice?.channel) {
			return message.util!.reply('you have to be in a voice channel first, silly.');
		}
		const DJ = message.member.roles.has(this.client.settings.get(message.guild!, SETTINGS.DJ));
		const queue = this.client.music.queues.get(message.guild!.id);
		if (DJ) await queue.stop();
		else await queue.player.pause();

		return message.util!.send(`${DJ ? 'Stopped' : 'Paused'} the queue.`);
	}
}
