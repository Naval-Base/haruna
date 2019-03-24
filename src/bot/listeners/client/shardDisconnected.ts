import { Listener } from 'discord-akairo';

export default class ShardDisconnectedListener extends Listener {
	public constructor() {
		super('shardDisconnected', {
			emitter: 'client',
			event: 'shardDisconnected',
			category: 'client'
		});
	}

	public exec(event: any, id: number) {
		this.client.logger.warn(`[SHARD ${id} DISCONNECTED] Ugh...I'm sorry...but, a loss is a loss... (${event.code})`, event);
		this.client.promServer.close();
		this.client.logger.info(`[SHARD ${id} DISCONNECTED][METRICS] Metrics server closed.`);
	}
}
