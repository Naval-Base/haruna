import { Command } from 'discord-akairo';
import { Message, Util } from 'discord.js';
import { Playlist } from '../../../models/Playlists';

export default class PlaylistCreateCommand extends Command {
	public constructor() {
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
					type: 'existingPlaylist',
					prompt: {
						start: (message: Message): string => `${message.author}, what playlist do you want to create?`,
						retry: (message: Message, { failure }: { failure: { value: string } }): string => `${message.author}, a playlist with the name **${failure.value}** already exists.`
					}
				},
				{
					id: 'info',
					match: 'rest',
					type: 'string'
				}
			]
		});
	}

	public async exec(message: Message, { playlist, info }: { playlist: any; info: string }): Promise<Message | Message[]> {
		const playlistRepo = this.client.db.getRepository(Playlist);
		const pls = new Playlist();
		pls.user = message.author!.id;
		pls.guild = message.guild!.id;
		pls.name = playlist;
		if (info) pls.description = Util.cleanContent(info, message);
		await playlistRepo.save(pls);

		return message.util!.reply(`successfully created **${pls.name}**.`);
	}
}
