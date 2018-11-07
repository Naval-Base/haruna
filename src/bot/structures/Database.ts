import { ConnectionManager } from 'typeorm';
import { Settings } from '../models/Settings';
import { Playlist } from '../models/Playlists';

const connectionManager = new ConnectionManager();
connectionManager.create({
	name: 'haruna',
	type: 'postgres',
	url: process.env.DB,
	synchronize: true,
	entities: [Settings, Playlist]
});

export default connectionManager;
