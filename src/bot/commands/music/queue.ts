import { Argument, Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import { stripIndents } from 'common-tags';
import paginate from '../../../util/paginate';
import timeString from '../../../util/timeString';

export default class QueueCommand extends Command {
	public constructor() {
		super('queue', {
			aliases: ['queue', 'q', 'nowplaying', 'np', 'ℹ'],
			description: {
				content: 'Shows you the current queue.',
				usage: '[page]',
				examples: ['1', '3']
			},
			category: 'music',
			channel: 'guild',
			ratelimit: 2,
			args: [
				{
					'id': 'page',
					'match': 'content',
					'type': Argument.compose((_, str): string => str.replace(/\s/g, ''), Argument.range(Argument.union('number', 'emojint'), 1, Infinity)),
					'default': 1
				}
			]
		});
	}

	public async exec(message: Message, { page }: { page: number }): Promise<Message | Message[]> {
		const queue = this.client.music.queues.get(message.guild!.id);
		const current = await queue.current();
		const tracks = [(current || { track: null }).track].concat(await queue.tracks()).filter((track): string | null => track);
		if (!tracks.length) return message.util!.send('Got nothing in queue!');
		const decoded = await this.client.music.decode(tracks as any[]);
		const totalLength = decoded.reduce((prev: number, song: { info: { length: number } }): number => prev + song.info.length, 0);
		const paginated = paginate(decoded.slice(1), page);
		let index = (paginated.page - 1) * 10;

		const embed = new MessageEmbed()
			.setAuthor(`${message.author!.tag} (${message.author!.id})`, message.author!.displayAvatarURL())
			.setDescription(stripIndents`
				**Now playing:**

				**❯** [${decoded[0].info.title}](${decoded[0].info.uri}) (${timeString(current!.position)}/${timeString(decoded[0].info.length)})

				**Song queue${paginated.page > 1 ? `, page ${paginated.page}` : ''}:**

				${paginated.items.length ? paginated.items.map((song): string => `**${++index}.** [${song.info.title}](${song.info.uri}) (${timeString(song.info.length)})`).join('\n') : 'No more songs in queue.'}

				**Total queue time:** ${timeString(totalLength)}
			`);
		if (paginated.maxPage > 1) embed.setFooter('Use queue <page> to view a specific page.');

		return message.util!.send(embed);
	}
}
