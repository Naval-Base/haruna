import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class Settings {
	@PrimaryColumn({ type: 'bigint' })
	guild!: string;
	@Column({ type: 'jsonb' })
	settings: any;
}
