module.exports = (sequelize, DataTypes) =>
	sequelize.define('playlists', {
		user: {
			type: DataTypes.BIGINT,
			allowNull: false
		},
		guild: {
			type: DataTypes.BIGINT,
			allowNull: false
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false
		},
		songs: {
			type: DataTypes.ARRAY(DataTypes.JSONB), // eslint-disable-line new-cap
			defaultValue: []
		},
		plays: {
			type: DataTypes.INTEGER,
			defaultValue: 0
		}
	}, {
		timestamps: true,
		indexes: [
			{ fields: ['user'] },
			{ fields: ['guild'] },
			{ fields: ['name'] }
		]
	});
