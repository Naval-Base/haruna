import { addBreadcrumb, captureException, Severity } from '@sentry/node';
import { Command, Listener } from 'discord-akairo';
import { Message } from 'discord.js';

export default class CommandErrorListener extends Listener {
	public constructor() {
		super('error', {
			emitter: 'commandHandler',
			event: 'error',
			category: 'commandHandler',
		});
	}

	public exec(error: Error, message: Message, command: Command) {
		this.client.logger.error(`[COMMAND ERROR] ${error.message}`, error.stack);
		addBreadcrumb({
			message: 'command_errored',
			category: command ? command.category.id : 'inhibitor',
			level: Severity.Error,
			data: {
				user: {
					id: message.author!.id,
					username: message.author!.tag,
				},
				guild: message.guild
					? {
							id: message.guild.id,
							name: message.guild.name,
					  }
					: null,
				command: command
					? {
							id: command.id,
							aliases: command.aliases,
							category: command.category.id,
					  }
					: null,
				message: {
					id: message.id,
					content: message.content,
				},
			},
		});
		captureException(error);
	}
}
