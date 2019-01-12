import HarunaClient from '../../client/HarunaClient';
import { Argument, Control, Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import { stripIndents } from 'common-tags';
import paginate from '../../../util/paginate';
import timeString from '../../../util/timeString';

export default class SkipCommand extends Command {
	public constructor() {
		super('skip', {
			aliases: ['skip', '🚶', '🏃'],
			description: {
				content: 'Skips the amount of songs you specify (defaults to 1)',
				usage: '<num>',
				examples: ['3', '1']
			},
			category: 'music',
			channel: 'guild',
			ratelimit: 2,
			args: [
				{
					id: 'force',
					match: 'flag',
					flag: ['--force', '-f']
				},
				Control.if((msg, args) => msg.member.roles.has((msg.client as HarunaClient).settings.get(msg.guild, 'djRole', undefined)) && args.force, [
					{
						id: 'num',
						match: 'rest',
						type: Argument.compose(str => str.replace(/\s/g, ''), Argument.range(Argument.union('number', 'emojint'), 1, Infinity)),
						default: 1
					}
				], [
					{
						id: 'num',
						match: 'rest',
						type: Argument.compose(str => str.replace(/\s/g, ''), Argument.range(Argument.union('number', 'emojint'), 1, 10)),
						default: 1
					}
				])
			]
		});
	}

	public async exec(message: Message, { num }: { num: number }) {
		if (!message.member.voice || !message.member.voice.channel) {
			return message.util!.reply('you have to be in a voice channel first, silly.');
		}
		const queue = this.client.music.queues.get(message.guild.id);
		let tracks;
		if (num > 1) tracks = await this.client.music.queues.redis.lrange(`playlists.${message.guild.id}`, 0, num - 2);
		const current = await queue.current();
		tracks = [(current || { track: null }).track].concat(tracks).filter(track => track);
		const skip = await queue.next(num);
		if (!skip) {
			await queue.stop();
			return message.util!.send('Skipped the last playing song.');
		}
		const decoded = await this.client.music.decode(tracks as any[]);
		const totalLength = decoded.reduce((prev: number, song: any) => prev + song.info.length, 0); // tslint:disable-line
		const paginated = paginate(decoded, 1, 10);
		let index = (paginated.page - 1) * 10;

		const embed = new MessageEmbed()
			.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL())
			.setDescription(stripIndents`
				**Skipped songs**

				${paginated.items.map(song => `**${++index}.** [${song.info.title}](${song.info.uri}) (${timeString(song.info.length)})`).join('\n')}

				**Total skipped time:** ${timeString(totalLength)}
			`);

		return message.util!.send(embed);
	}
}
