const { Argument, Command } = require('discord-akairo');
const url = require('url');
const path = require('path');

class PlayCommand extends Command {
	constructor() {
		super('playlist-add', {
			description: {
				content: '',
				usage: '<link/playlist>',
				examples: []
			},
			category: 'music',
			channel: 'guild',
			ratelimit: 2,
			args: [
				{
					'id': 'query',
					'match': 'content',
					'type': Argument.compose('string', string => string ? string.replace(/<(.+)>/g, '$1') : ''), // eslint-disable-line no-confusing-arrow
					'default': ''
				}
			]
		});
	}

	async exec(message, { query }) {
		if (!query && message.attachments.first()) {
			query = message.attachments.first().url;
			if (!['.mp3', '.ogg', '.flac', '.m4a'].includes(path.parse(url.parse(query).path).ext)) return;
		} else if (!query) {
			return;
		}
		if (!['http:', 'https:'].includes(url.parse(query).protocol)) query = `ytsearch:${query}`;
		await this.client.music.load(query);
	}
}

module.exports = PlayCommand;
