import { Listener } from 'discord-akairo';

export default class ShardDisconnectListener extends Listener {
	public constructor() {
		super('shardDisconnect', {
			emitter: 'client',
			event: 'shardDisconnect',
			category: 'client',
		});
	}

	public exec(event: any, id: number) {
		this.client.logger.warn(
			`[SHARD ${id} DISCONNECT] Ugh...I'm sorry...but, a loss is a loss... (${event.code})`,
			event,
		);
		this.client.promServer.close();
		this.client.logger.info(`[SHARD ${id} DISCONNECT][METRICS] Metrics server closed.`);
	}
}
