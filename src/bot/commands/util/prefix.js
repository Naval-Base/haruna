const { Command } = require('discord-akairo');

class PrefixCommand extends Command {
	constructor() {
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

	exec(message) {
		return message.util.send(`The current prefixes for this guild are: ${this.handler.prefix.join(' | ')}`);
	}
}

module.exports = PrefixCommand;
