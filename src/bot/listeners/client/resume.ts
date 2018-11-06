import { Listener } from 'discord-akairo';

export default class ResumeListener extends Listener {
	public constructor() {
		super('resumed', {
			emitter: 'client',
			event: 'resumed',
			category: 'client'
		});
	}

	public exec(events: number) {
		this.client.logger.info(`Alright, next time I'll--Eh...again...? (replayed ${events} events)`);
	}
}
