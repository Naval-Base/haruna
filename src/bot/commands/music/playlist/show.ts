import { stripIndents } from 'common-tags';
import { Argument, Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import paginate from '../../../../util/paginate';
import timeString from '../../../../util/timeString';
import { Playlist } from '../../../models/Playlists';

export default class PlaylistShowCommand extends Command {
	public constructor() {
		super('playlist-show', {
			category: 'music',
			description: {
				content: 'Displays songs from a playlist.',
				usage: '<playlist> [page]',
			},
			channel: 'guild',
			clientPermissions: ['EMBED_LINKS'],
			ratelimit: 2,
			args: [
				{
					id: 'playlist',
					match: 'content',
					type: 'playlist',
					prompt: {
						start: (message: Message) => `${message.author}, what playlist do you want information on?`,
						retry: (message: Message, { failure }: { failure: { value: string } }) =>
							`${message.author}, a playlist with the name **${failure.value}** does not exist.`,
					},
				},
				{
					id: 'page',
					match: 'content',
					type: Argument.compose(
						(_, str) => str.replace(/\s/g, ''),
						Argument.range(Argument.union('number', 'emojint'), 1, Infinity),
					),
					default: 1,
				},
			],
		});
	}

	public async exec(message: Message, { playlist, page }: { playlist: Playlist; page: number }) {
		if (!playlist.songs.length) return message.util!.send('This playlist has no songs!');
		const decoded = await this.client.music.decode(playlist.songs);
		const totalLength = decoded.reduce((prev, song) => prev + song.info.length, 0);
		const paginated = paginate(decoded, page);
		let index = (paginated.page - 1) * 10;

		const embed = new MessageEmbed().setAuthor(
			`${message.author!.tag} (${message.author!.id})`,
			message.author!.displayAvatarURL(),
		).setDescription(stripIndents`
				**Song list${paginated.page > 1 ? `, page ${paginated.page}` : ''}**

				${paginated.items
					.map(song => `**${++index}.** [${song.info.title}](${song.info.uri}) (${timeString(song.info.length)})`)
					.join('\n')}

				**Total list time:** ${timeString(totalLength)}
			`);
		if (paginated.maxPage > 1) embed.setFooter('Use playlist show <playlist> <page> to view a specific page.');

		return message.util!.send(embed);
	}
}
