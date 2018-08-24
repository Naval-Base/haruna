const { Command } = require('discord-akairo');

class PlaylistRemoveCommand extends Command {
	constructor() {
		super('playlist-remove', {
			description: {
				content: 'Removes a song from the playlist.',
				usage: '<playlist> <number>',
				examples: []
			},
			category: 'music',
			channel: 'guild',
			ratelimit: 2,
			args: [
				{
					id: 'playlist',
					match: 'content',
					type: 'playlist',
					prompt: {
						start: message => `${message.author}, what playlist should this song/playlist be removed from?`,
						retry: (message, _, provided) => `${message.author}, a playlist with the name **${provided.phrase}** does not exist.`
					}
				},
				{
					'id': 'number',
					'match': 'content',
					'type': 'number',
					'default': 1
				}
			]
		});
	}

	async exec(message, { playlist, number }) {
		if (playlist.user !== message.author.id) return message.util.reply('you can only remove songs from your own playlists.');
		number = number >= 1 ? number - 1 : playlist.songs.length - (~number + 1);
		const decoded = await this.client.music.decode([playlist.songs[number]]);
		playlist.songs.splice(number, 1);
		await this.client.db.models.playlists.update({ songs: playlist.songs });

		return message.util.send(`${this.client.emojis.get('479430354759843841')} **Removed:** \`${decoded[0].info.title}\``);
	}
}

module.exports = PlaylistRemoveCommand;
