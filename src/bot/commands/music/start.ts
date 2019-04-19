import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class StartCommand extends Command {
	public constructor() {
		super('start', {
			aliases: ['start', '▶', '🎶', '🎵', '🎼', '🎹', '🎺', '🎻', '🎷', '🎸', '🎤', '🎧', '🥁'],
			description: {
				content: 'Joins and starts the queue.',
				usage: '[--force/-f]',
				examples: ['--force', '-f']
			},
			category: 'music',
			channel: 'guild',
			ratelimit: 2,
			args: [
				{
					id: 'force',
					match: 'flag',
					flag: ['--force', '-f']
				}
			]
		});
	}

	public async exec(message: Message, { force }: { force: boolean }): Promise<Message | Message[] | void> {
		if (!message.member.voice || !message.member.voice.channel) {
			return message.util!.reply('you have to be in a voice channel first, silly.');
		} else if (!message.member.voice.channel.joinable) {
			return message.util!.reply("I don't seem to have permission to enter this voice channel.");
		} else if (!message.member.voice.channel.speakable) {
			return message.util!.reply("I don't seem to have permission to talk in this voice channel.");
		}
		const queue = this.client.music.queues.get(message.guild.id);
		if (!message.guild.me.voice || !message.guild.me.voice.channel || force) {
			await queue.player.join(message.member.voice.channel.id);
			message.util!.send(this.client.emojis.get('479430325169160193')!.toString());
		}
		if ((!queue.player.playing && !queue.player.paused) || force) await queue.start();
	}
}
