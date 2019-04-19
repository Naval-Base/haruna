import { Listener } from 'discord-akairo';

export default class ShardResumeListener extends Listener {
	public constructor() {
		super('shardResumed', {
			emitter: 'client',
			event: 'shardResumed',
			category: 'client'
		});
	}

	public exec(id: number): void {
		this.client.logger.info(`[SHARD ${id} RESUMED] Alright, next time I'll--Eh...again...?`);
		this.client.promServer.listen(5501);
		this.client.logger.info(`[SHARD ${id} RESUMED][METRICS] Metrics listening on 5501`);
	}
}
