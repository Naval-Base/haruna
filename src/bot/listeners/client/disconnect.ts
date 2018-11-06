import { Listener } from 'discord-akairo';

export default class DisconnectListener extends Listener {
	public constructor() {
		super('disconnect', {
			emitter: 'client',
			event: 'disconnect',
			category: 'client'
		});
	}

	public exec(event: any) {
		this.client.logger.warn(`Ugh...I'm sorry...but, a loss is a loss... (${event.code})`);
	}
}
