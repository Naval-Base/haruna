import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { Playlist } from '../../../models/Playlists';

export default class PlaylistLoadCommand extends Command {
	public constructor() {
		super('playlist-load', {
			description: {
				content: 'Loads a playlist into the queue.',
				usage: '<playlist>',
			},
			category: 'music',
			channel: 'guild',
			ratelimit: 2,
			args: [
				{
					id: 'playlist',
					match: 'content',
					type: 'playlist',
					prompt: {
						start: (message: Message) => `${message.author}, what playlist should be played?`,
						retry: (message: Message, { failure }: { failure: { value: string } }) =>
							`${message.author}, a playlist with the name **${failure.value}** does not exist.`,
					},
				},
			],
		});
	}

	public async exec(message: Message, { playlist }: { playlist: Playlist }) {
		if (!message.member!.voice || !message.member!.voice.channel) {
			return message.util!.reply('you have to be in a voice channel first, silly.');
		} else if (!message.member!.voice.channel.joinable) {
			return message.util!.reply("I don't seem to have permission to enter this voice channel.");
		} else if (!message.member!.voice.channel.speakable) {
			return message.util!.reply("I don't seem to have permission to talk in this voice channel.");
		}
		const user = await this.client.users.fetch(playlist.user);
		const queue = this.client.music.queues.get(message.guild!.id);
		if (!message.guild!.me!.voice.channel) await queue.player.join(message.member!.voice.channel.id);
		await queue.add(...playlist.songs);
		if (!queue.player.playing && !queue.player.paused) await queue.start();
		const playlistRepo = this.client.db.getRepository(Playlist);
		playlist.plays += 1;
		await playlistRepo.save(playlist);

		return message.util!.send(`**Queued up:** \`${playlist.name}\` from ${user.tag}`);
	}
}
