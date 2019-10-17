import { stripIndents } from 'common-tags';
import { Argument, Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import { SETTINGS } from '../../../util/constants';
import paginate from '../../../util/paginate';
import timeString from '../../../util/timeString';
import HarunaClient from '../../client/HarunaClient';

export default class SkipCommand extends Command {
	public constructor() {
		super('skip', {
			aliases: ['skip', '🚶', '🏃'],
			description: {
				content: 'Skips the amount of songs you specify (defaults to 1)',
				usage: '<num>',
				examples: ['3', '1'],
			},
			category: 'music',
			channel: 'guild',
			ratelimit: 2,
			flags: ['-f'],
		});
	}

	public *args(msg: Message) {
		const force = yield {
			match: 'flag',
			flag: ['--force', '-f'],
		};

		const num = yield msg.member!.roles.has((msg.client as HarunaClient).settings.get(msg.guild!, SETTINGS.DJ)) && force
			? {
					match: 'rest',
					type: Argument.compose(
						(_, str) => str.replace(/\s/g, ''),
						Argument.range(Argument.union('number', 'emojint'), 1, Infinity),
					),
			  }
			: {
					match: 'rest',
					type: Argument.compose(
						(_, str) => str.replace(/\s/g, ''),
						Argument.range(Argument.union('number', 'emojint'), 1, 10),
					),
			  };

		return { num };
	}

	public async exec(message: Message, { num }: { num: number }) {
		if (!message.member!.voice || !message.member!.voice.channel) {
			return message.util!.reply('you have to be in a voice channel first, silly.');
		}
		const queue = this.client.music.queues.get(message.guild!.id);
		let tracks;
		if (num > 1) tracks = await this.client.music.queues.redis.lrange(`playlists.${message.guild!.id}`, 0, num - 2);
		const current = await queue.current();
		tracks = [(current || { track: null }).track].concat(tracks).filter(track => track);
		const skip = await queue.next(num);
		if (!skip) {
			await queue.stop();
			return message.util!.send('Skipped the last playing song.');
		}
		const decoded = await this.client.music.decode(tracks as any[]);
		const totalLength = decoded.reduce((prev, song) => prev + song.info.length, 0);
		const paginated = paginate(decoded, 1, 10);
		let index = (paginated.page - 1) * 10;

		const embed = new MessageEmbed().setAuthor(
			`${message.author.tag} (${message.author.id})`,
			message.author.displayAvatarURL(),
		).setDescription(stripIndents`
				**Skipped songs**

				${paginated.items
					.map(song => `**${++index}.** [${song.info.title}](${song.info.uri}) (${timeString(song.info.length)})`)
					.join('\n')}

				**Total skipped time:** ${timeString(totalLength)}
			`);

		return message.util!.send(embed);
	}
}
