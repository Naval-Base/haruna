import { Argument, Command } from 'discord-akairo';
import { Message } from 'discord.js';
import * as url from 'url';
import * as path from 'path';
import { Playlist } from '../../../models/Playlists';

export default class PlaylistAddCommand extends Command {
	public constructor() {
		super('playlist-add', {
			description: {
				content: 'Adds a song to the playlist.',
				usage: '<playlist> <link/playlist>',
				examples: []
			},
			category: 'music',
			channel: 'guild',
			ratelimit: 2,
			args: [
				{
					id: 'playlist',
					type: 'playlist',
					prompt: {
						start: (message: Message) => `${message.author}, what playlist should this song/playlist be added to?`,
						retry: (message: Message, _: never, provided: { phrase: string }) => `${message.author}, a playlist with the name **${provided.phrase}** does not exist.`
					}
				},
				{
					'id': 'query',
					'match': 'rest',
					'type': Argument.compose('string', string => string ? string.replace(/<(.+)>/g, '$1') : ''), // eslint-disable-line no-confusing-arrow
					'default': ''
				}
			]
		});
	}

	public async exec(message: Message, { playlist, query }: { playlist: any, query: string }) {
		if (playlist.user !== message.author.id) return message.util!.reply('you can only add songs to your own playlists.');
		if (!query && message.attachments.first()) {
			query = message.attachments.first()!.url;
			if (!['.mp3', '.ogg', '.flac', '.m4a'].includes(path.parse(url.parse(query).path!).ext)) return;
		} else if (!query) {
			return;
		}
		if (!['http:', 'https:'].includes(url.parse(query).protocol!)) query = `ytsearch:${query}`;
		// TODO: remove hack
		const res: any = await this.client.music.load(query);

		let msg;
		if (['TRACK_LOADED', 'SEARCH_RESULT'].includes(res.loadType)) {
			playlist.songs.push(res.tracks[0].track);
			msg = res.tracks[0].info.title;
		} else if (res.loadType === 'PLAYLIST_LOADED') {
			playlist.songs.push(...res.tracks.map((track: { track: string }) => track.track));
			msg = res.playlistInfo.name;
		} else {
			return message.util!.send("I know you hate to hear that, but even searching the universe I couldn't find what you were looking for.");
		}
		const playlistRepo = this.client.db.getRepository(Playlist);
		await playlistRepo.save(playlist);

		return message.util!.send(`${this.client.emojis.get('479430354759843841')} **Added to playlist:** \`${msg}\``);
	}
}
