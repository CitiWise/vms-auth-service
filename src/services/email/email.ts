import { logger } from '../../utils/logger';
import nodemailer from 'nodemailer';
interface ISendEmailParams {
    to: string[] | string;
    subject: string;
    text?: string;
    html?: string;
}

class EmailService {
    private transporter;

    constructor() {
       

        this.transporter = nodemailer.createTransport({
        });
    }

    formatToEmails(to: string[] | string): string {
        if (Array.isArray(to)) {
            return to.join(',');
        }

        return to;
    }

    async send({ to, subject, text, html }: ISendEmailParams) {
        try {
            const { NOTIFY_MAIL } = process.env;

            const info = await this.transporter.sendMail({
                from: NOTIFY_MAIL,
                to: this.formatToEmails(to),
                subject,
                text,
                html
            });

            logger.info(`E-Mail sent: ${info.messageId}`);
        } catch (error) {
            logger.error(error);
            throw error;
        }
    }
}

const emailService = new EmailService();

export { emailService };
