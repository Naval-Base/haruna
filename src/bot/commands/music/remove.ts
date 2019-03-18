import { Argument, Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class RemoveCommand extends Command {
	public constructor() {
		super('remove', {
			aliases: ['remove', 'rm', '📤'],
			description: {
				content: 'Removes a song from the queue.',
				usage: '[num]',
				examples: ['3', '6']
			},
			category: 'music',
			channel: 'guild',
			ratelimit: 2,
			args: [
				{
					id: 'num',
					match: 'content',
					type: Argument.compose((_, str) => str.replace(/\s/g, ''), Argument.union('number', 'emojint'))
				}
			]
		});
	}

	public async exec(message: Message, { num }: { num: number }) {
		if (!message.member.voice || !message.member.voice.channel) {
			return message.util!.reply('you have to be in a voice channel first, silly.');
		}
		const queue = this.client.music.queues.get(message.guild.id);
		const tracks = await queue.tracks();
		num = num >= 1 ? num - 1 : tracks.length - (~num + 1);
		const decoded = await this.client.music.decode([tracks[num]]);
		queue.remove(tracks[num]);

		return message.util!.send(`${this.client.emojis.get('479430354759843841')} **Removed:** \`${decoded[0].info.title}\``);
	}
}
