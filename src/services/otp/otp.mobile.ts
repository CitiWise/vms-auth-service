import { logger } from '@sentry/utils';
import axios from 'axios';
import { RedisConnection } from '../../libs/redisConnection';
import { Otp } from './otp.service';
import { MAX_RESEND_OTP_ATTEMPTS, redisPrefix } from '../../utils/constants';
import { getTimeLeftForTheDay } from '../../utils/date';

class OtpMobile extends Otp {
    constructor() {
        super();
    }

    /**
     * sends the otp using msg 91 api
     */
    public static async send(key, phone) {
        try {
            const dailyBreachLimit = await this.getDailyBreachLimit(key);

            if (dailyBreachLimit >= MAX_RESEND_OTP_ATTEMPTS) {
                throw new Error('You have exceeded maximum Phone OTPs for the day. Please try again tomorrow!');
            }

            const otp = await super.generate(key);
            // send otp here
            await axios.get(
                `https://api.msg91.com/api/v5/otp?template_id=${process.env.TEMPLATE_ID}&mobile=91${phone}&authkey=${process.env.MSG91_AUTH_KEY}&otp=${otp}`
            );
            this.updateDailyBreachLimit(key, dailyBreachLimit + 1);
        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    /**
     * updates the daily breach limit for OTP sent
     */
    public static async updateDailyBreachLimit(key: string, updatedCount: number) {
        const totalTimeLeftForDay = getTimeLeftForTheDay();

        const { client } = RedisConnection;
        client.hmset(`${redisPrefix.totalOtpSent}${key}`, { value: updatedCount });
        client.expire(`${redisPrefix.totalOtpSent}${key}`, totalTimeLeftForDay);
    }

    /**
     * gets the daily breach limit for OTP sent
     */
    public static async getDailyBreachLimit(key: string): Promise<number> {
        try {
            const data: any = await RedisConnection.client.hgetall(`${redisPrefix.totalOtpSent}${key}`);

            return Number(data?.value || '');
        } catch (error) {
            logger.error(error);
            throw error;
        }
    }
}

export default OtpMobile;
