import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class LeaveCommand extends Command {
	public constructor() {
		super('leave', {
			aliases: ['leave', '🚪'],
			description: {
				content: 'Leaves the voice channel (`--clear` to clear the queue before leaving)',
				usage: '[--clear/-c]',
				examples: ['--clear', '-c']
			},
			category: 'music',
			channel: 'guild',
			ratelimit: 2,
			args: [
				{
					id: 'clear',
					match: 'flag',
					flag: ['--clear', '-c']
				}
			]
		});
	}

	public async exec(message: Message, { clear }: { clear: boolean }): Promise<Message | Message[]> {
		if (!message.member.voice || !message.member.voice.channel) {
			return message.util!.reply('you have to be in a voice channel first, silly.');
		}
		const DJ = message.member.roles.has(this.client.settings.get(message.guild, 'djRole', undefined));
		const queue = this.client.music.queues.get(message.guild.id);
		if (clear && DJ) await queue.clear();
		await queue.player.stop();
		await queue.player.destroy();
		if (message.guild.me.voice || message.guild.me.voice!.channel) await queue.player.leave();

		return message.util!.send(this.client.emojis.get('479430325169160193')!.toString());
	}
}
