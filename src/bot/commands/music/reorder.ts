import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { stripIndents } from 'common-tags';

interface Actions {
	kind?: 'single' | 'slice' | 'spread';
	from?: number;
	to?: number;
	num?: number;
	reverse?: boolean;
}

export default class ReorderCommand extends Command {
	constructor() {
		super('reorder', {
			aliases: ['reorder', '↕'],
			description: {
				content: stripIndents`
					Reorders the current queue.
					A number means that the song at that number currently will be moved to that position.
					A dash between two numbers means to move all the songs, starting from first number to the second number.
					A \\* means to spread the remaining songs out (multiple \\* will split it evenly).
				`,
				usage: '<ordering>',
				examples: ['1-3 7 *', '1 2 3 *']
			},
			category: 'music',
			channel: 'guild',
			ratelimit: 2,
			args: [
				{
					id: 'ordering',
					match: 'content'
				}
			]
		});
	}

	public async exec(message: Message, { ordering }: { ordering: any }) {
		if (!ordering) {
			return message.util!.reply('You have to supply a new order for the songs.');
		}
		const orderingRegex = /\s*(\d+)-(\d+)\s*|\s*(\d+)\s*|\s*(\*)\s*/g;
		const orderingMatch = ordering.match(orderingRegex);
		if (orderingMatch && orderingMatch.join('').length === ordering.length) {
			return message.util!.reply('You have to supply a valid new order for the songs.');
		}

		const queue = this.client.music.queues.get(message.guild.id);
		const queueLength = await queue.length(); // tslint:disable-line
		const actions: Actions[] = [];
		let match;
		while ((match = orderingRegex.exec(ordering)) !== null) { // tslint:disable-line
			if (match[1]) {
				let from = Number(match[1]) - 1;
				let to = Number(match[2]) - 1;
				let reverse = false;
				if (to < from) {
					[from, to] = [to, from];
					reverse = true;
				}

				if (from >= queueLength || to >= queueLength) {
					return message.util!.reply('Some song numbers were out of bound.');
				}

				actions.push({
					kind: 'slice',
					from,
					to,
					reverse
				});
			} else if (match[3]) {
				const num = Number(match[3]) - 1;
				if (num >= queueLength) {
					return message.util!.reply('Some song numbers were out of bound.');
				}

				actions.push({
					kind: 'single',
					num
				});
			} else {
				actions.push({
					kind: 'spread'
				});
			}
		}

		const tracks = await queue.tracks();
		const numbers = new Set(Array.from({ length: queueLength }, (_, i) => i));
		const newTracks = [];
		for (const action of actions) {
			switch (action.kind) {
				case 'single':
					newTracks.push(tracks[action.num!]);
					numbers.delete(action.num!);
					break;
				case 'slice':
					const slice = tracks.slice(action.from, action.to! + 1);
					if (action.reverse) slice.reverse();
					newTracks.push(...slice);
					for (let i = action.from!; i <= action.to!; i++) {
						numbers.delete(i);
					}
					break;
				case 'spread':
					newTracks.push('*');
					break;
				default:
					break;
			}
		}

		const spreadAmount = actions.filter(a => a.kind === 'spread').length;
		if (spreadAmount) {
			const sliceSize = Math.ceil(numbers.size / spreadAmount);
			const numbersA = Array.from(numbers);
			for (let i = 0; i < newTracks.length; i++) {
				if (newTracks[i] === '*') {
					newTracks.splice(i, 1, ...numbersA.splice(0, sliceSize));
				}
			}
		}
		await queue.clear();
		await queue.add(...newTracks);

		return message.util!.reply('The queue has been reordered.');
	}
}
