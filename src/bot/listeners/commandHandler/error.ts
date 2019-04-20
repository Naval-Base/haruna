import { Listener, Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { addBreadcrumb, captureException } from '@sentry/node';

export default class CommandErrorListener extends Listener {
	public constructor() {
		super('error', {
			emitter: 'commandHandler',
			event: 'error',
			category: 'commandHandler'
		});
	}

	public exec(error: Error, message: Message, command: Command): void {
		this.client.logger.error(`[COMMAND ERROR] ${error.message}`, error.stack);
		addBreadcrumb({
			message: 'command_errored',
			category: command ? command.category.id : 'inhibitor',
			data: {
				user: {
					id: message.author.id,
					username: message.author.tag
				},
				guild: message.guild
					? {
						id: message.guild.id,
						name: message.guild.name
					}
					: null,
				command: command
					? {
						id: command.id,
						aliases: command.aliases,
						category: command.category.id
					}
					: null,
				message: {
					id: message.id,
					content: message.content
				}
			}
		});
		captureException(error);
	}
}
