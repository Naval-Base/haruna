import { Command } from 'discord-akairo';
import { Message, Role } from 'discord.js';

export default class SetDJRoleCommand extends Command {
	public constructor() {
		super('set-dj', {
			aliases: ['set-dj', 'dj-role'],
			description: {
				content: 'Sets the DJ role many of the commands use for permission checking.',
				usage: '<role>',
				examples: ['dj @DJ', 'dj DJ']
			},
			category: 'util',
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			ratelimit: 2,
			args: [
				{
					id: 'role',
					match: 'content',
					type: 'role'
				}
			]
		});
	}

	public async exec(message: Message, { role }: { role: Role }): Promise<Message | Message[]> {
		this.client.settings.set(message.guild, 'djRole', role.id);
		return message.util!.reply(`set DJ role to **${role.name}**`);
	}
}
