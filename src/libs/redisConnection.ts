import Redis from 'ioredis';
import dotenv from 'dotenv';
import path from 'path';
import * as bluebird from 'bluebird';

import { logger } from '../utils/logger';

dotenv.config({ path: path.join(__dirname, '../../.env') });

export class RedisConnection {
    static client: any;
    // Initialize your redis connection
    public static async init(): Promise<any> {
        if (this.client) {
            return;
        }


        const { REDIS_HOST, REDIS_PORT } = process.env;
        // @ts-ignore
        this.client = new Redis({
            host: REDIS_HOST || '127.0.0.1',
            port: REDIS_PORT || 6379
        });

        const t1 = Date.now();

        (this.client as any).Promise = bluebird;

        return new Promise((resolve, reject) => {
            this.client.on('connect', () => {
                logger.info(`Connected to redis server in ${Date.now() - t1}ms`);
                resolve(1);
            });

            this.client.on('error', (err: Error) => {
                logger.info('Failed to connect to redis server');
                reject(`Failed to connect to redis ${err?.message}`);
            });
        });
    }
}
