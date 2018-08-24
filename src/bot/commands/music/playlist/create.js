const { Command } = require('discord-akairo');
const { Util } = require('discord.js');

class PlaylistCreateCommand extends Command {
	constructor() {
		super('playlist-create', {
			category: 'music',
			description: {
				content: 'Creates a playlist.',
				usage: '<playlist> [info]'
			},
			channel: 'guild',
			ratelimit: 2,
			args: [
				{
					id: 'playlist',
					match: 'content',
					type: 'existingPlaylist',
					prompt: {
						start: message => `${message.author}, what playlist do you want to create?`,
						retry: (message, _, provided) => `${message.author}, a playlist with the name **${provided.phrase}** already exists.`
					}
				},
				{
					id: 'info',
					match: 'content',
					type: 'string'
				}
			]
		});
	}

	async exec(message, { playlist, info }) {
		const pls = await this.client.db.models.playlists.create({
			user: message.author.id,
			guild: message.guild.id,
			name: playlist,
			description: Util.cleanContent(info, message)
		});

		return message.util.reply(`successfully created **${pls.name}**.`);
	}
}

module.exports = PlaylistCreateCommand;
