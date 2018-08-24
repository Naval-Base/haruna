const { Command } = require('discord-akairo');

class PlaylistRemoveCommand extends Command {
	constructor() {
		super('playlist-remove', {
			description: {
				content: 'Removes a song from the playlist.',
				usage: '<playlist> <position>',
				examples: []
			},
			category: 'music',
			channel: 'guild',
			ratelimit: 2,
			args: [
				{
					id: 'playlist',
					type: 'playlist',
					prompt: {
						start: message => `${message.author}, what playlist should this song/playlist be removed from?`,
						retry: (message, _, provided) => `${message.author}, a playlist with the name **${provided.phrase}** does not exist.`
					}
				},
				{
					'id': 'position',
					'match': 'rest',
					'type': 'number',
					'default': 1
				}
			]
		});
	}

	async exec(message, { playlist, position }) {
		if (playlist.user !== message.author.id) return message.util.reply('you can only remove songs from your own playlists.');
		position = position >= 1 ? position - 1 : playlist.songs.length - (~position + 1);
		const decoded = await this.client.music.decode([playlist.songs[position]]);
		playlist.songs.splice(position, 1);
		await this.client.db.models.playlists.update({ songs: playlist.songs });

		return message.util.send(`${this.client.emojis.get('479430354759843841')} **Removed:** \`${decoded[0].info.title}\``);
	}
}

module.exports = PlaylistRemoveCommand;
