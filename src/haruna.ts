import 'reflect-metadata';
import HarunaClient from './bot/client/HarunaClient';
import { __rootdir__ } from './root';

const client = new HarunaClient({ owner: process.env.OWNERS, token: process.env.TOKEN, root: __rootdir__ });

client
	.on('error', err => client.logger.error(`[CLIENT ERROR] ${err.message}`, err.stack))
	.on('shardError', (err, id) => client.logger.error(`[SHARD ${id} ERROR] ${err.message}`, err.stack))
	.on('warn', warn => client.logger.warn(`[CLIENT WARN] ${warn}`));

client.start();
