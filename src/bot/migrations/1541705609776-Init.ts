import {MigrationInterface, QueryRunner} from "typeorm";

export class Init1541705609776 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "playlists" ALTER COLUMN "songs" SET DEFAULT ARRAY[]::text[]`);
        await queryRunner.query(`ALTER TABLE "settings" ALTER COLUMN "settings" SET DEFAULT '{}'::jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "settings" ALTER COLUMN "settings" SET DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "playlists" ALTER COLUMN "songs" SET DEFAULT ARRAY[]`);
    }

}
