import { Argument, Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { Playlist } from '../../../models/Playlists';

export default class PlaylistRemoveCommand extends Command {
	public constructor() {
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
						start: (message: Message) => `${message.author}, what playlist should this song/playlist be removed from?`,
						retry: (message: Message, { failure }: { failure: { data: string } }) => `${message.author}, a playlist with the name **${failure.data}** does not exist.`
					}
				},
				{
					id: 'position',
					match: 'rest',
					type: Argument.compose((_, str) => str.replace(/\s/g, ''), Argument.range(Argument.union('number', 'emojint'), 1, Infinity)),
					default: 1
				}
			]
		});
	}

	public async exec(message: Message, { playlist, position }: { playlist: any, position: number }) {
		if (playlist.user !== message.author.id) return message.util!.reply('you can only remove songs from your own playlists.');
		position = position >= 1 ? position - 1 : playlist.songs.length - (~position + 1);
		const decoded = await this.client.music.decode([playlist.songs[position]]);
		const playlistRepo = this.client.db.getRepository(Playlist);
		playlist.songs.splice(position, 1);
		await playlistRepo.save(playlist);

		return message.util!.send(`${this.client.emojis.get('479430354759843841')} **Removed:** \`${decoded[0].info.title}\``);
	}
}
