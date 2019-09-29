import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('playlists')
export class Playlist {
	@PrimaryGeneratedColumn()
	public id!: number;

	@Column({ type: 'bigint' })
	public user!: string;

	@Column({ type: 'bigint' })
	public guild!: string;

	@Column({ type: 'text' })
	public name!: string;

	@Column({ type: 'text' })
	public description!: string | null;

	@Column({ type: 'text', array: true, default: '{}' })
	public songs!: string[];

	@Column({ default: 0 })
	public plays!: number;
}
