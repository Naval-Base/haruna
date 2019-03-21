import { Command } from 'discord-akairo';
import { Message, Util } from 'discord.js';
import { Playlist } from '../../../models/Playlists';

export default class PlaylistEditCommand extends Command {
	public constructor() {
		super('playlist-edit', {
			category: 'music',
			description: {
				content: 'Edits the description of a playlist.',
				usage: '<playlist> <info>'
			},
			channel: 'guild',
			ratelimit: 2,
			args: [
				{
					id: 'playlist',
					type: 'playlist',
					prompt: {
						start: (message: Message) => `${message.author}, what playlists description do you want to edit?`,
						retry: (message: Message, { failure }: { failure: { value: string } }) => `${message.author}, a playlist with the name **${failure.value}** does not exist.`
					}
				},
				{
					id: 'info',
					match: 'rest',
					type: 'string',
					prompt: {
						start: (message: Message) => `${message.author}, what should the new description be?`
					}
				}
			]
		});
	}

	public async exec(message: Message, { playlist, info }: { playlist: any, info: string }) {
		if (playlist.user !== message.author.id) return message.util!.reply('you can only edit your own playlists.');
		const playlistRepo = this.client.db.getRepository(Playlist);
		playlist.description = Util.cleanContent(info, message);
		await playlistRepo.save(playlist);

		return message.util!.reply(`successfully updated **${playlist.name}s** description.`);
	}
}
