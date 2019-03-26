import HarunaClient from '../../client/HarunaClient';
import { Listener } from 'discord-akairo';

export default class ShardReconnectListener extends Listener {
	public constructor() {
		super('shardReconnecting', {
			emitter: 'client',
			event: 'shardReconnecting',
			category: 'client'
		});
	}

	public exec(id: number) {
		this.client.logger.info(`[SHARD ${id} RECONNECTING] Firepower--full force!!`);
		this.client.promServer.close();
		this.client.logger.info(`[SHARD ${id} RECONNECTING][METRICS] Metrics server closed.`);
	}
}
