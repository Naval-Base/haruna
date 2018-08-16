const { Listener } = require('discord-akairo');

class ResumeListener extends Listener {
	constructor() {
		super('resumed', {
			emitter: 'client',
			event: 'resumed',
			category: 'client'
		});
	}

	exec(events) {
		this.client.logger.info(`Alright, next time I'll--Eh...again...? (replayed ${events} events)`);
	}
}

module.exports = ResumeListener;
