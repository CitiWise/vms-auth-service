import * as Sentry from '@sentry/node';
import Transport from 'winston-transport';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    release: '1.0', // change this dynamically later
    ignoreErrors: ['Non-Error exception captured']
});

const logToSentry = (err: any) => {
    if (err && err.extra) {
        Sentry.withScope((scope) => {
            scope.setExtra('extra', err.extra);
            Sentry.captureException(err);
        });
    } else if (typeof err === 'string') {
        Sentry.captureMessage(err);
    } else {
        Sentry.captureException(err);
    }
};

class SentryTransport extends Transport {
    constructor(opts: object) {
        super(opts);
    }

    log(err, callback) {
        logToSentry(err);
        callback();
    }
}

export default SentryTransport;
