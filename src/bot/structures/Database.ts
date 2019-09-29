import { ConnectionManager } from 'typeorm';
import { Playlist } from '../models/Playlists';
import { Setting } from '../models/Settings';

const connectionManager = new ConnectionManager();
connectionManager.create({
	name: 'haruna',
	type: 'postgres',
	url: process.env.DB,
	entities: [Setting, Playlist],
});

export default connectionManager;
