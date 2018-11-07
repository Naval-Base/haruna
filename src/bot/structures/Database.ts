import { ConnectionManager } from 'typeorm';
import { Setting } from '../models/Settings';
import { Playlist } from '../models/Playlists';

const connectionManager = new ConnectionManager();
connectionManager.create({
	name: 'haruna',
	type: 'postgres',
	url: process.env.DB,
	synchronize: true,
	entities: [Setting, Playlist]
});

export default connectionManager;
