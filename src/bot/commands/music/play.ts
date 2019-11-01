import { Argument, Command } from 'discord-akairo';
import { Message } from 'discord.js';
import * as path from 'path';
import * as url from 'url';

export default class PlayCommand extends Command {
	public constructor() {
		super('play', {
			aliases: ['play', 'p', 'add', '📥', '➕'],
			description: {
				content: 'Play a song from literally any source you can think of.',
				usage: '<link/search>',
				examples: ['justin bieber'],
			},
			category: 'music',
			channel: 'guild',
			ratelimit: 2,
			args: [
				{
					id: 'unshift',
					match: 'flag',
					flag: ['--next', '-n', '--start', '-s'],
				},
				{
					id: 'query',
					match: 'rest',
					type: Argument.compose('string', (_, str) => str?.replace(/<(.+)>/g, '$1')),
					default: '',
				},
			],
		});
	}

	public async exec(message: Message, { query, unshift }: { query: string; unshift: boolean }) {
		if (!message.member?.voice?.channel) {
			return message.util!.reply('you have to be in a voice channel first, silly.');
		} else if (!message.member.voice.channel.joinable) {
			return message.util!.reply("I don't seem to have permission to enter this voice channel.");
		} else if (!message.member.voice.channel.speakable) {
			return message.util!.reply("I don't seem to have permission to talk in this voice channel.");
		}
		if (!query && message.attachments.first()) {
			query = message.attachments.first()!.url;
			if (!['.mp3', '.ogg', '.flac', '.m4a'].includes(path.parse(url.parse(query).path!).ext)) return;
		} else if (!query) {
			return;
		}
		if (!['http:', 'https:'].includes(url.parse(query).protocol!)) query = `ytsearch:${query}`;
		const res = await this.client.music.load(query);
		const queue = this.client.music.queues.get(message.guild!.id);
		if (!message.guild?.me?.voice.channel) await queue.player.join(message.member.voice.channel.id);
		let msg;
		if (['TRACK_LOADED', 'SEARCH_RESULT'].includes(res.loadType)) {
			if (unshift) await queue.unshift(res.tracks[0].track);
			else await queue.add(res.tracks[0].track);
			msg = res.tracks[0].info.title;
		} else if (res.loadType === 'PLAYLIST_LOADED') {
			await queue.add(...res.tracks.map(track => track.track));
			msg = res.playlistInfo.name;
		} else {
			return message.util!.send(
				"I know you hate to hear that, but even searching the universe I couldn't find what you were looking for.",
			);
		}
		if (!queue.player.playing && !queue.player.paused) await queue.start();

		return message.util!.send(`**Queued up:** \`${msg}\``);
	}
}
