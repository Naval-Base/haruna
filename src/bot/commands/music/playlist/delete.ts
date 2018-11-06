import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class PlaylistDeleteCommand extends Command {
	public constructor() {
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
						start: (message: Message) => `${message.author}, what playlist do you want to delete?`,
						retry: (message: Message, _: never, provided: { phrase: string }) => `${message.author}, a playlist with the name **${provided.phrase}** does not exist.`
					}
				}
			]
		});
	}

	public exec(message: Message, { playlist }: { playlist: any }) {
		if (playlist.user !== message.author.id) return message.util!.reply('you can only delete your own playlists.');
		playlist.destroy();

		return message.util!.reply(`successfully deleted **${playlist.name}**.`);
	}
}
