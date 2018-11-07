import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('playlists')
export class Playlist {
	@PrimaryGeneratedColumn()
	id!: number;
	@Column({ type: 'bigint' })
	user!: string;
	@Column({ type: 'bigint' })
	guild!: string;
	@Column({ type: 'text' })
	name!: string;
	@Column({ type: 'text' })
	description!: string | null;
	@Column({ type: 'jsonb', array: true, default: [] })
	songs!: any[];

	@Column({ default: 0 })
	plays!: number;
}
