import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

export default {
    type: 'mysql',
    replication: {
        master: {
            host: process.env.MYSQL_HOST,
            port: Number(process.env.MYSQL_PORT),
            username: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DB
        },
        slaves: [
            {
                host: process.env.MYSQL_READ_HOST,
                port: Number(process.env.MYSQL_PORT),
                username: process.env.MYSQL_USER,
                password: process.env.MYSQL_PASSWORD,
                database: process.env.MYSQL_DB
            }
        ]
    },
    legacySpatialSupport: false,
    synchronize: false,
    logging: false,
    entities: [path.join(__dirname, '../entities/**/*.ts'), path.join(__dirname, '../entities/**/*.js')],
    migrations: [path.join(__dirname, '../migrations/**/*.ts')],
    subscribers: [path.join(__dirname, '../subscribers/**/*.ts'), path.join(__dirname, '../subscribers/**/*.js')],
    cli: {
        entitiesDir: 'src/typeorm/entities',
        migrationsDir: 'src/typeorm/migrations',
        subscribersDir: 'src/typeorm/subscribers'
    },
    extra: {
        connectionLimit: 20
    }
};
