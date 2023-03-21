import { MigrationInterface, QueryRunner } from "typeorm";

export class ab1679421700142 implements MigrationInterface {
    name = 'ab1679421700142'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`ums_access_token\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`entity_id\` varchar(36) NOT NULL, \`client_id\` varchar(36) NOT NULL, \`token\` varchar(36) NOT NULL, \`expiry\` bigint NOT NULL, \`metadata\` text NULL, UNIQUE INDEX \`IDX_5306e2cb54f0bf879a29aa440b\` (\`token\`), UNIQUE INDEX \`IDX_8bdb5e4bdfdacaa127f6e77a8e\` (\`client_id\`, \`entity_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`ums_client_info\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`client_id\` varchar(36) NOT NULL, \`client_secret\` varchar(100) NOT NULL, \`client_attributes\` json NOT NULL, \`token_expiry_millis\` bigint NOT NULL, UNIQUE INDEX \`IDX_9e9692de15e43f5b2eac4042c4\` (\`client_id\`, \`client_secret\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`ums_client_info_redirect_urls\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`client_id\` varchar(36) NOT NULL, \`redirect_url\` text NOT NULL, INDEX \`IDX_3ce27b9bec93d2873bd5cfef8f\` (\`client_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`ums_cookie_info\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`name\` varchar(100) NOT NULL, \`value\` varchar(100) NOT NULL, \`entity_id\` varchar(36) NOT NULL, \`expiry\` bigint NOT NULL, \`client_id\` varchar(36) NOT NULL, UNIQUE INDEX \`IDX_97fb4aa89f66e5bc4698e597c8\` (\`value\`), INDEX \`IDX_11b69c94cd5b859dba9c3a22ce\` (\`client_id\`, \`entity_id\`), UNIQUE INDEX \`IDX_700f7a455e38bd4f80fd50a416\` (\`client_id\`, \`value\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`ums_entity_profile\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`entity_id\` varchar(36) NOT NULL, \`profile_type\` varchar(100) NOT NULL, \`profile_value\` text NOT NULL, INDEX \`IDX_c54db1bd02fe4a1cbbe9b848aa\` (\`entity_id\`, \`profile_type\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`ums_entity_id_contact\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`entity_id\` varchar(36) NOT NULL, \`contact_type\` varchar(100) NOT NULL, \`contact_value\` varchar(100) NOT NULL, \`status\` varchar(50) NULL, INDEX \`IDX_cf30e249e27a5ec1a10e2d7276\` (\`entity_id\`), INDEX \`IDX_e06d751539c057941888196ae3\` (\`contact_type\`, \`contact_value\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`ums_oauth_code\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`entity_id\` varchar(36) NOT NULL, \`client_id\` varchar(36) NOT NULL, \`code\` varchar(100) NOT NULL, \`expiry\` bigint NOT NULL, \`stale\` tinyint NOT NULL, \`metadata\` text NULL, UNIQUE INDEX \`IDX_bf236aae92c9cfb3f71142eeef\` (\`code\`, \`stale\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`ums_address\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`type\` varchar(50) NULL, \`line1\` text NOT NULL, \`line2\` text NULL, \`landmark\` varchar(1000) NULL, \`city\` varchar(100) NOT NULL, \`state\` varchar(100) NOT NULL, \`country\` varchar(100) NULL, \`pincode\` varchar(10) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`ums_entity_id_contact\` ADD CONSTRAINT \`FK_cf30e249e27a5ec1a10e2d72768\` FOREIGN KEY (\`entity_id\`) REFERENCES \`ums_entity_profile\`(\`entity_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`ums_entity_id_contact\` DROP FOREIGN KEY \`FK_cf30e249e27a5ec1a10e2d72768\``);
        await queryRunner.query(`DROP TABLE \`ums_address\``);
        await queryRunner.query(`DROP INDEX \`IDX_bf236aae92c9cfb3f71142eeef\` ON \`ums_oauth_code\``);
        await queryRunner.query(`DROP TABLE \`ums_oauth_code\``);
        await queryRunner.query(`DROP INDEX \`IDX_e06d751539c057941888196ae3\` ON \`ums_entity_id_contact\``);
        await queryRunner.query(`DROP INDEX \`IDX_cf30e249e27a5ec1a10e2d7276\` ON \`ums_entity_id_contact\``);
        await queryRunner.query(`DROP TABLE \`ums_entity_id_contact\``);
        await queryRunner.query(`DROP INDEX \`IDX_c54db1bd02fe4a1cbbe9b848aa\` ON \`ums_entity_profile\``);
        await queryRunner.query(`DROP TABLE \`ums_entity_profile\``);
        await queryRunner.query(`DROP INDEX \`IDX_700f7a455e38bd4f80fd50a416\` ON \`ums_cookie_info\``);
        await queryRunner.query(`DROP INDEX \`IDX_11b69c94cd5b859dba9c3a22ce\` ON \`ums_cookie_info\``);
        await queryRunner.query(`DROP INDEX \`IDX_97fb4aa89f66e5bc4698e597c8\` ON \`ums_cookie_info\``);
        await queryRunner.query(`DROP TABLE \`ums_cookie_info\``);
        await queryRunner.query(`DROP INDEX \`IDX_3ce27b9bec93d2873bd5cfef8f\` ON \`ums_client_info_redirect_urls\``);
        await queryRunner.query(`DROP TABLE \`ums_client_info_redirect_urls\``);
        await queryRunner.query(`DROP INDEX \`IDX_9e9692de15e43f5b2eac4042c4\` ON \`ums_client_info\``);
        await queryRunner.query(`DROP TABLE \`ums_client_info\``);
        await queryRunner.query(`DROP INDEX \`IDX_8bdb5e4bdfdacaa127f6e77a8e\` ON \`ums_access_token\``);
        await queryRunner.query(`DROP INDEX \`IDX_5306e2cb54f0bf879a29aa440b\` ON \`ums_access_token\``);
        await queryRunner.query(`DROP TABLE \`ums_access_token\``);
    }

}
