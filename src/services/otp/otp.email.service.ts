import { Otp } from './otp.service';
import { MAX_RESEND_OTP_ATTEMPTS, redisPrefix } from '../../utils/constants';
import { emailService } from '../email';
import { populateTemplateWithValues } from '../../utils/email';
import { logger } from '../../utils/logger';
import { RedisConnection } from '../../libs/redisConnection';
import { getTimeLeftForTheDay } from '../../utils/date';
export class EmailOtp extends Otp {
    constructor() {
        super();
    }

    public static async send(key, email, emailTemplateFileName, emailSubject) {
        try {
            const dailyBreachLimit = await this.getDailyBreachLimit(key);

            if (dailyBreachLimit >= MAX_RESEND_OTP_ATTEMPTS) {
                throw new Error('You have exceeded maximum Email OTPs for the day. Please try again tomorrow!');
            }

            const otp = await super.generate(key);

            const htmlTemplate = populateTemplateWithValues(emailTemplateFileName, { OTP: otp });
            await emailService.send({ to: email, subject: emailSubject, html: htmlTemplate });

            this.updateDailyBreachLimit(key, dailyBreachLimit + 1);
        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    public static updateDailyBreachLimit(key: string, updatedCount: number): void {
        const timeLeftForTheDay = getTimeLeftForTheDay();

        const { client } = RedisConnection;
        client.hmset(`${redisPrefix.totalOtpSent}${key}`, { value: updatedCount });
        client.expire(`${redisPrefix.totalOtpSent}${key}`, timeLeftForTheDay);
    }

    public static async getDailyBreachLimit(key: string): Promise<number> {
        try {
            const data: any = await RedisConnection.client.hgetall(`${redisPrefix.totalOtpSent}${key}`);
            return Number(data?.value || 0);
        } catch (error) {
            throw error;
        }
    }
}
