const { Argument, Control, Command } = require('discord-akairo');
const { MessageEmbed } = require('discord.js');
const { stripIndents } = require('common-tags');
const paginate = require('../../../util/paginate');
const timeString = require('../../../util/timeString');

class SkipCommand extends Command {
	constructor() {
		super('skip', {
			aliases: ['skip', '🚶', '🏃'],
			description: {
				content: 'Skips the amount of songs you specify (defaults to 1)',
				usage: '<number>',
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
				Control.if((msg, args) => msg.member.roles.has(msg.client.settings.get(msg.guild, 'djRole')) && args.force, [
					{
						'id': 'number',
						'match': 'rest',
						'type': Argument.compose(string => string.replace(/\s/g, ''), Argument.range(Argument.union('number', 'emojint'), 1, Infinity)),
						'default': 1
					}
				], [
					{
						'id': 'number',
						'match': 'rest',
						'type': Argument.compose(string => string.replace(/\s/g, ''), Argument.range(Argument.union('number', 'emojint'), 1, 10)),
						'default': 1
					}
				])
			]
		});
	}

	async exec(message, { number }) {
		if (!message.member.voice || !message.member.voice.channel) {
			return message.util.reply('You have to be in a voice channel first, silly.');
		}
		const queue = this.client.music.queues.get(message.guild.id);
		let tracks;
		if (number > 1) tracks = await this.client.music.queues.redis.lrange(`playlists.${message.guild.id}`, 0, number - 2);
		tracks = [(await queue.current()).track].concat(tracks);
		const skip = await queue.next(number);
		if (!skip) {
			await queue.stop();
			return message.util.send('Skipped the last playing song.');
		}
		const decoded = await this.client.music.decode(tracks.filter(track => track));
		const totalLength = decoded.reduce((prev, song) => prev + song.info.length, 0);
		const paginated = paginate(decoded, 1, 10);
		let index = 10 * (paginated.page - 1);

		const embed = new MessageEmbed()
			.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL())
			.setDescription(stripIndents`
				**Skipped songs**

				${paginated.items.map(song => `**${++index}.** [${song.info.title}](${song.info.uri}) (${timeString(song.info.length)})`).join('\n')}

				**Total skipped time:** ${timeString(totalLength)}
			`);

		return message.util.send(embed);
	}
}

module.exports = SkipCommand;
