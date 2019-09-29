import { Listener } from 'discord-akairo';

export default class ShardResumeListener extends Listener {
	public constructor() {
		super('shardResume', {
			emitter: 'client',
			event: 'shardResume',
			category: 'client',
		});
	}

	public exec(id: number) {
		this.client.logger.info(`[SHARD ${id} RESUME] Alright, next time I'll--Eh...again...?`);
		this.client.promServer.listen(5501);
		this.client.logger.info(`[SHARD ${id} RESUME][METRICS] Metrics listening on 5501`);
	}
}
