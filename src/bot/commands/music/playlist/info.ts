import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import * as moment from 'moment';
import 'moment-duration-format';

export default class PlaylistInfoCommand extends Command {
	public constructor() {
		super('playlist-info', {
			category: 'music',
			description: {
				content: 'Displays information about a playlist.',
				usage: '<playlist>'
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
						start: (message: Message): string => `${message.author}, what playlist do you want information on?`,
						retry: (message: Message, { failure }: { failure: { value: string } }): string => `${message.author}, a playlist with the name **${failure.value}** does not exist.`
					}
				}
			]
		});
	}

	public async exec(message: Message, { playlist }: { playlist: any }): Promise<Message | Message[]> {
		const user = await this.client.users.fetch(playlist.user);
		const guild = this.client.guilds.get(playlist.guild);
		const embed = new MessageEmbed()
			.setColor(3447003)
			.addField('❯ Name', playlist.name)
			.addField('❯ Description', playlist.description ? playlist.description.substring(0, 1020) : 'No description.')
			.addField('❯ User', user ? `${user.tag} (ID: ${user.id})` : "Couldn't fetch user.")
			.addField('❯ Guild', guild ? `${guild.name}` : "Couldn't fetch guild.")
			.addField('❯ Songs', playlist.songs.length || 'No songs.')
			.addField('❯ Plays', playlist.plays)
			.addField('❯ Created at', moment.utc(playlist.createdAt).format('YYYY/MM/DD hh:mm:ss'))
			.addField('❯ Modified at', moment.utc(playlist.updatedAt).format('YYYY/MM/DD hh:mm:ss'));

		return message.util!.send(embed);
	}
}
