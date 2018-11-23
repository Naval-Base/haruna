import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { stripIndents } from 'common-tags';

interface SingleAction {
	kind: 'single';
	num: number;
}

interface SliceAction {
	kind: 'slice';
	from: number;
	to: number;
	reverse: boolean;
}

interface SpreadAction {
	kind: 'spread';
}

type Action = SingleAction | SliceAction | SpreadAction;

interface OrderingMatch {
	sliceFrom?: string;
	sliceTo?: string;
	singleNum?: string;
	spread?: string;
}

const orderingRegex = /\s*(?<sliceFrom>\d+)-(?<sliceTo>\d+)\s*|\s*(?<singleNum>\d+)\s*|\s*(?<spread>\*)\s*/g;

export default class ReorderCommand extends Command {
	constructor() {
		super('reorder', {
			aliases: ['reorder', '↕'],
			description: {
				content: stripIndents`
					Reorders the current queue.
					A number means that the song at that number currently will be moved to that position.
					A '-' between two numbers means to move all the songs, starting from first number to the second number.
					A '\\*' means to spread the remaining songs out (multiple '\\*' will split it evenly).
				`,
				usage: '<ordering>',
				examples: ['1-3 7 *', '1 2 3 *', '10-7 * 1 2 3 3 * 10-7']
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

	public async exec(message: Message, { ordering }: { ordering: string | null }) {
		if (!ordering) {
			return message.util!.reply('You have to supply a new order for the songs.');
		}
		const orderingMatch = ordering.match(orderingRegex);
		if (!orderingMatch || orderingMatch.join('').length !== ordering.length) {
			return message.util!.reply('You have to supply a valid new order for the songs.');
		}

		const queue = this.client.music.queues.get(message.guild.id);
		const queueLength = await queue.length(); // tslint:disable-line
		const actions: Action[] = [];
		let match;
		while ((match = orderingRegex.exec(ordering)) !== null) { // tslint:disable-line
			const groups: OrderingMatch = match.groups!;
			if (groups.sliceFrom && groups.sliceTo) {
				let from = Number(groups.sliceFrom) - 1;
				let to = Number(groups.sliceTo) - 1;
				let reverse = false;
				if (to < from) {
					[from, to] = [to, from];
					reverse = true;
				}

				if (from >= queueLength || to >= queueLength || from < 0 || to < 0) {
					return message.util!.reply('Some song numbers were out of bound.');
				}

				actions.push({
					kind: 'slice',
					from,
					to,
					reverse
				});
			} else if (groups.singleNum) {
				const num = Number(groups.singleNum) - 1;
				if (num >= queueLength || num < 0) {
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
		const unusedIndices = new Set(Array.from({ length: queueLength }, (_, i) => i));
		const newTracks = [];
		for (const action of actions) {
			switch (action.kind) {
				case 'single':
					newTracks.push(tracks[action.num]);
					unusedIndices.delete(action.num);
					break;
				case 'slice':
					const slice = tracks.slice(action.from, action.to + 1);
					if (action.reverse) slice.reverse();
					newTracks.push(...slice);
					for (let i = action.from; i <= action.to; i++) {
						unusedIndices.delete(i);
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
			const sliceSize = Math.ceil(unusedIndices.size / spreadAmount);
			const unusedTracks = Array.from(unusedIndices, n => tracks[n]);
			for (let i = 0; i < newTracks.length; i++) {
				if (newTracks[i] === '*') {
					newTracks.splice(i, 1, ...unusedTracks.splice(0, sliceSize));
				}
			}
		}
		await queue.store.redis.del(queue.keys.next);
		await queue.add(...newTracks);

		return message.util!.reply('The queue has been reordered.');
	}
}
