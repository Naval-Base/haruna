const { Listener } = require('discord-akairo');

class DisconnectListener extends Listener {
	constructor() {
		super('disconnect', {
			emitter: 'client',
			event: 'disconnect',
			category: 'client'
		});
	}

	exec(event) {
		this.client.logger.warn(`Ugh...I'm sorry...but, a loss is a loss... (${event.code})`);
	}
}

module.exports = DisconnectListener;
