import { CustomError } from '../../utils/errors';
import { RedisConnection } from '../../libs/redisConnection';
import { OTP_VERIFICATION_EXPIRY_TIME, MAX_INCORRECT_ATTEMPTS_ALLOWED } from '../../utils/constants';

export class Otp {
    public static async generate(key: string, length = 6) {
        let otp: string;
        const data: any = await RedisConnection.client.hgetall(key);

        if (data?.value) {
            otp = data.value;
        } else {
            otp = new Array(length).fill(0).reduce((acc, d) => acc + String(Math.floor(Math.random() * 10)), '');
            this.save(key, otp);
        }

        return otp;
    }

    static save(key: string, otp: string) {
        const { client } = RedisConnection;
        client.hmset(key, { value: otp, totalAttempts: 0 });
        client.expire(key, OTP_VERIFICATION_EXPIRY_TIME);
    }

    static async verify(key: string, otpToVerify: any) {
        let data: any;
        try {
            const { client } = RedisConnection;
            data = await client.hgetall(key);
            if (!data) {
                throw new CustomError('Otp is not available or expired. Please generate a new OTP!', '000045');
            }

            if (Number(data.totalAttempts) >= MAX_INCORRECT_ATTEMPTS_ALLOWED) {
                await client.del(key);
                data = null;
                throw new CustomError('Maximum retry attempts executed. Generate a new otp!', '000046');
            }

            if (String(data.value) !== String(otpToVerify)) {
                throw new CustomError('Incorrect OTP!', '000047');
            }

            await client.del(key);
            data = null;
            return;
        } catch (error) {
            throw error;
        } finally {
            if (data) {
                RedisConnection.client.hmset(key, { ...data, totalAttempts: +data.totalAttempts + 1 });
            }
        }
    }
}
