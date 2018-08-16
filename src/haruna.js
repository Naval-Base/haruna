require('dotenv').config();
const HarunaClient = require('./bot/client/HarunaClient');

const client = new HarunaClient({ owner: process.env.OWNERS, token: process.env.TOKEN });

client
	.on('error', err => client.logger.error(`Error:\n${err.stack}`))
	.on('warn', warn => client.logger.warn(`Warning:\n${warn}`));

client.start();
