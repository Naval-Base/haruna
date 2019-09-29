import { Provider } from 'discord-akairo';
import { Guild } from 'discord.js';
import { Repository } from 'typeorm';
import { Settings } from '../../util/constants';
import { Setting } from '../models/Settings';

export default class TypeORMProvider extends Provider {
	public ['constructor']: typeof TypeORMProvider;

	public constructor(private readonly repo: Repository<Setting>) {
		super();
	}

	public async init() {
		const settings = await this.repo.find();
		for (const setting of settings) {
			this.items.set(setting.guild, setting.settings);
		}
	}

	public get<K extends keyof Settings, T = undefined>(
		guild: string | Guild,
		key: K,
		defaultValue?: T,
	): Settings[K] | T {
		const id = this.constructor.getGuildId(guild);
		if (this.items.has(id)) {
			const value = this.items.get(id)[key];
			return value == null ? defaultValue : value;
		}

		return defaultValue as T;
	}

	public async set(guild: string | Guild, key: string, value: any) {
		const id = this.constructor.getGuildId(guild);
		const data = this.items.get(id) || {};
		data[key] = value;
		this.items.set(id, data);

		return this.repo
			.createQueryBuilder()
			.insert()
			.into(Setting)
			.values({ guild: id, settings: data })
			.onConflict('("guild") DO UPDATE SET "settings" = :settings')
			.setParameter('settings', data)
			.execute();
	}

	public async delete(guild: string | Guild, key: string) {
		const id = this.constructor.getGuildId(guild);
		const data = this.items.get(id) || {};
		delete data[key];

		return this.repo
			.createQueryBuilder()
			.insert()
			.into(Setting)
			.values({ guild: id, settings: data })
			.onConflict('("guild") DO UPDATE SET "settings" =:settings')
			.setParameter('settings', null)
			.execute();
	}

	public async clear(guild: string | Guild) {
		const id = this.constructor.getGuildId(guild);
		this.items.delete(id);

		return this.repo.delete(id);
	}

	private static getGuildId(guild: string | Guild) {
		if (guild instanceof Guild) return guild.id;
		if (guild === 'global' || guild === null) return '0';
		if (typeof guild === 'string' && /^\d+$/.test(guild)) return guild;
		throw new TypeError('Invalid guild specified. Must be a Guild instance, guild ID, "global", or null.');
	}
}
