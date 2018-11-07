import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class PrefixCommand extends Command {
	public constructor() {
		super('prefix', {
			aliases: ['prefix'],
			description: {
				content: 'Displays the prefix of the bot.'
			},
			category: 'util',
			channel: 'guild',
			ratelimit: 2
		});
	}

	public exec(message: Message) {
		return message.util!.send(`The current prefixes for this guild are: ${(this.handler.prefix as string[]).join(' | ')}`);
	}
}
