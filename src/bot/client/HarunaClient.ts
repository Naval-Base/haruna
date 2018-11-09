import { join } from 'path';
import { AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler } from 'discord-akairo';
import { Util } from 'discord.js';
import { Client as Lavaqueue } from 'lavaqueue';
import { Logger, createLogger, transports, format } from 'winston';
import Storage, { ReferenceType } from 'rejects';
import database from '../structures/Database';
import TypeORMProvider from '../structures/SettingsProvider';
import { Setting } from '../models/Settings';
import { Connection } from 'typeorm';
import { ExtendedRedis } from 'lavaqueue/typings/QueueStore';
import { Playlist } from '../models/Playlists';
import { Counter, Gauge, collectDefaultMetrics, register } from 'prom-client';
import { createServer } from 'http';
import { parse } from 'url';
const Raven = require('raven');

declare module 'discord-akairo' {
	interface AkairoClient {
		logger: Logger;
		db: Connection;
		settings: TypeORMProvider;
		music: Lavaqueue;
		redis: ExtendedRedis;
		storage: Storage;
		config: HarunaOptions;
		prometheus: {
			commandCounter: Counter;
		};
	}
}

interface HarunaOptions {
	owner?: string;
	token?: string;
}

export default class HarunaClient extends AkairoClient {
	public logger = createLogger({
		format: format.combine(
			format.colorize({ all: true }),
			format.timestamp({ format: 'YYYY/MM/DD HH:mm:ss' }),
			format.printf(info => `[${info.timestamp}] ${info.level}: ${info.message}`)
		),
		transports: [new transports.Console()]
	});

	public db!: Connection;

	public settings!: TypeORMProvider;

	public music = new Lavaqueue({
		userID: process.env.ID!,
		password: process.env.LAVALINK_PASSWORD!,
		hosts: {
			rest: process.env.LAVALINK_REST!,
			ws: process.env.LAVALINK_WS!,
			redis: process.env.REDIS ? {
				port: 6379,
				host: process.env.REDIS,
				db: 0
			} : undefined
		},
		send: (guild, packet) => {
			const shardGuild = this.guilds.get(guild);
			if (shardGuild) shardGuild.shard.send(packet);
			return Promise.resolve();
		}
	});

	public redis = this.music.queues.redis;

	public storage = new Storage(this.redis);

	public commandHandler = new CommandHandler(this, {
		directory: join(__dirname, '..', 'commands'),
		prefix: ['🎶', '🎵', '🎼', '🎹', '🎺', '🎻', '🎷', '🎸', '🎤', '🎧', '🥁'],
		aliasReplacement: /-/g,
		allowMention: true,
		handleEdits: true,
		commandUtil: true,
		commandUtilLifetime: 3e5,
		defaultCooldown: 3000,
		defaultPrompt: {
			modifyStart: str => `${str}\n\nType \`cancel\` to cancel the command.`,
			modifyRetry: str => `${str}\n\nType \`cancel\` to cancel the command.`,
			timeout: 'Guess you took too long, the command has been cancelled.',
			ended: "More than 3 tries and you still didn't quite get it. The command has been cancelled",
			cancel: 'The command has been cancelled.',
			retries: 3,
			time: 30000
		}
	});
	public inhibitorHandler = new InhibitorHandler(this, { directory: join(__dirname, '..', 'inhibitors') });

	public listenerHandler = new ListenerHandler(this, { directory: join(__dirname, '..', 'listeners') });

	public config: HarunaOptions;

	public prometheus = {
		messagesCounter: new Counter({ name: 'haruna_messages_total', help: 'Total number of messages Haruna has seen' }),
		commandCounter: new Counter({ name: 'haruna_commands_total', help: 'Total number of commands used' }),
		collectDefaultMetrics,
		register
	};

	public constructor(config: HarunaOptions) {
		super({ ownerID: config.owner }, {
			disableEveryone: true,
			disabledEvents: ['TYPING_START']
		});

		this.on('raw', async (packet: any) => {
			switch (packet.t) {
				case 'VOICE_STATE_UPDATE':
					if (packet.d.user_id !== process.env.ID) return;
					this.music.voiceStateUpdate(packet.d);
					const players: { guild_id: string, channel_id?: string }[] = await this.storage.get('players', { type: ReferenceType.ARRAY });
					let index: number = 0;
					if (Array.isArray(players)) index = players.findIndex(player => player.guild_id === packet.d.guild_id);
					if (((!players && !index) || index < 0) && packet.d.channel_id) {
						await this.storage.upsert('players', [{ guild_id: packet.d.guild_id, channel_id: packet.d.channel_id }]);
					} else if (players && typeof index !== 'undefined' && index >= 0 && !packet.d.channel_id) {
						players.splice(index, 1);
						await this.storage.delete('players');
						if (players.length) await this.storage.set('players', players);
					}
					break;
				case 'VOICE_SERVER_UPDATE':
					this.music.voiceServerUpdate(packet.d);
					break;
				case 'MESSAGE_CREATE':
					this.prometheus.messagesCounter.inc();
					break;
				default:
					break;
			}
		});

		this.commandHandler.resolver.addType('playlist', async (phrase, message) => {
			if (!phrase) return null;
			phrase = Util.cleanContent(phrase.toLowerCase(), message);
			const playlistRepo = this.db.getRepository(Playlist);
			const playlist = await playlistRepo.findOne({ name: phrase, guild: message.guild.id });

			return playlist || null;
		});
		this.commandHandler.resolver.addType('existingPlaylist', async (phrase, message) => {
			if (!phrase) return null;
			phrase = Util.cleanContent(phrase.toLowerCase(), message);
			const playlistRepo = this.db.getRepository(Playlist);
			const playlist = await playlistRepo.findOne({ name: phrase, guild: message.guild.id });

			return playlist ? null : phrase;
		});

		this.config = config;

		if (process.env.RAVEN) {
			Raven.config(process.env.RAVEN, {
				captureUnhandledRejections: true,
				autoBreadcrumbs: true,
				environment: process.env.NODE_ENV,
				release: '0.1.0'
			}).install();
		} else {
			process.on('unhandledRejection', this.logger.error);
		}

		this.prometheus.collectDefaultMetrics({ prefix: 'haruna_', timeout: 30000 });
	}

	private async _init() {
		this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
		this.commandHandler.useListenerHandler(this.listenerHandler);
		this.listenerHandler.setEmitters({
			commandHandler: this.commandHandler,
			inhibitorHandler: this.inhibitorHandler,
			listenerHandler: this.listenerHandler
		});

		this.commandHandler.loadAll();
		this.inhibitorHandler.loadAll();
		this.listenerHandler.loadAll();

		this.db = database.get('haruna');
		await this.db.connect();
		this.settings = new TypeORMProvider(this.db.getRepository(Setting));
		await this.settings.init();
	}

	public metrics() {
		createServer((req, res) => {
			if (parse(req.url!).pathname === '/metrics') {
				res.writeHead(200, { 'Content-Type': this.prometheus.register.contentType });
				res.write(this.prometheus.register.metrics());
			}
			res.end();
		}).listen(5501);
	}

	public async start() {
		await this._init();
		return this.login(this.config.token);
	}
}
