const { Command } = require('discord-akairo');

class PlaylistDeleteCommand extends Command {
	constructor() {
		super('playlist-delete', {
			category: 'music',
			description: {
				content: 'Deletes a playlist.',
				usage: '<playlist>'
			},
			channel: 'guild',
			ratelimit: 2,
			args: [
				{
					id: 'playlist',
					match: 'content',
					type: 'playlist',
					prompt: {
						start: message => `${message.author}, what playlist do you want to delete?`,
						retry: (message, _, provided) => `${message.author}, a playlist with the name **${provided.phrase}** does not exist.`
					}
				}
			]
		});
	}

	exec(message, { playlist }) {
		if (playlist.user !== message.author.id) return message.util.reply('you can only delete your own playlists.');
		playlist.destroy();

		return message.util.reply(`successfully deleted **${playlist.name}**.`);
	}
}

module.exports = PlaylistDeleteCommand;
