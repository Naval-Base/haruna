import { Command } from 'discord-akairo';
import { Message, User } from 'discord.js';
import { SETTINGS } from '../../../util/constants';

export default class BlacklistCommand extends Command {
	public constructor() {
		super('blacklist', {
			aliases: ['blacklist', 'unblacklist'],
			description: {
				content: 'Prohibit/Allow a user from using Yukikaze.',
				usage: '<user>',
				examples: ['Crawl', '@Crawl', '81440962496172032'],
			},
			category: 'util',
			ownerOnly: true,
			ratelimit: 2,
			args: [
				{
					id: 'user',
					match: 'content',
					type: 'user',
					prompt: {
						start: (message: Message) => `${message.author}, who would you like to blacklist/unblacklist?`,
					},
				},
			],
		});
	}

	public async exec(message: Message, { user }: { user: User }) {
		const blacklist = this.client.settings.get('global', SETTINGS.BLACKLIST, ['']);
		if (blacklist.includes(user.id)) {
			const index = blacklist.indexOf(user.id);
			blacklist.splice(index, 1);
			if (blacklist.length === 0) this.client.settings.delete('global', SETTINGS.BLACKLIST);
			else this.client.settings.set('global', SETTINGS.BLACKLIST, blacklist);

			return message.util!.send(
				`${user.tag}, ha!...If I wore gloves, I wouldn't have to dirty my hands hitting you next time.`,
			);
		}

		blacklist.push(user.id);
		this.client.settings.set('global', SETTINGS.BLACKLIST, blacklist);

		return message.util!.send(`${user.tag}, you've let down my expectations--`);
	}
}
