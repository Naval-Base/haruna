import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { Playlist } from '../../../models/Playlists';

export default class PlaylistDeleteCommand extends Command {
	public constructor() {
		super('playlist-delete', {
			category: 'music',
			description: {
				content: 'Deletes a playlist.',
				usage: '<playlist>',
			},
			channel: 'guild',
			ratelimit: 2,
			args: [
				{
					id: 'playlist',
					match: 'content',
					type: 'playlist',
					prompt: {
						start: (message: Message) => `${message.author}, what playlist do you want to delete?`,
						retry: (message: Message, { failure }: { failure: { value: string } }) =>
							`${message.author}, a playlist with the name **${failure.value}** does not exist.`,
					},
				},
			],
		});
	}

	public async exec(message: Message, { playlist }: { playlist: Playlist }) {
		if (playlist.user !== message.author.id) return message.util!.reply('you can only delete your own playlists.');
		const playlistRepo = this.client.db.getRepository(Playlist);
		await playlistRepo.remove(playlist);

		return message.util!.reply(`successfully deleted **${playlist.name}**.`);
	}
}
