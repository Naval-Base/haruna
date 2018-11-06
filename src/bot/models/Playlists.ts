import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
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
	description!: string;
	@Column({ type: 'jsonb', array: true })
	songs: any;

	@Column()
	plays!: number;
}
