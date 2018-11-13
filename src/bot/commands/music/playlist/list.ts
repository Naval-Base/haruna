import { Argument, Command } from 'discord-akairo';
import { Message, MessageEmbed, GuildMember } from 'discord.js';
import { stripIndents } from 'common-tags';
import paginate from '../../../../util/paginate';
import { Playlist } from '../../../models/Playlists';

export default class PlaylistListCommand extends Command {
	public constructor() {
		super('playlist-list', {
			category: 'music',
			description: {
				content: 'Displays all playlists (from a specific user).',
				usage: '[member]'
			},
			channel: 'guild',
			clientPermissions: ['EMBED_LINKS'],
			ratelimit: 2,
			args: [
				{
					id: 'member',
					type: 'member'
				},
				{
					id: 'page',
					type: Argument.compose(str => str.replace(/\s/g, ''), Argument.range(Argument.union('number', 'emojint'), 1, Infinity))
				}
			]
		});
	}

	public async exec(message: Message, { member, page }: { member: GuildMember, page: number }) {
		const where = member ? { user: member.id, guild: message.guild.id } : { guild: message.guild.id };
		const playlistRepo = this.client.db.getRepository(Playlist);
		const playlists = await playlistRepo.find(where);
		if (!playlists.length) return message.util!.send(`${member ? `${member.displayName}` : `${message.guild.name}`} doesn't have any playlists.`);
		const paginated = paginate(playlists, page);

		const embed = new MessageEmbed()
			.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL())
			.setDescription(stripIndents`
				**Playlists${paginated.page > 1 ? `, page ${paginated.page}` : ''}**

				${paginated.items.map(playlist => `** • ** ${playlist.name}`).join('\n')}
			`);
		if (paginated.maxPage > 1) embed.setFooter('Use playlist list <member> <page> to view a specific page.');

		return message.util!.send(embed);
	}
}
