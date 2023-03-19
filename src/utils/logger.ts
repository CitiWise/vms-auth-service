import * as logger from 'winston';
import { Request } from 'express';
import morgan from 'morgan';
import SentryTransport from './sentry';

// logger config
const format = logger.format.combine(
    logger.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss:ms' }),
    logger.format.colorize({ all: false }),
    logger.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
);

logger.addColors({
    debug: 'green',
    info: 'cyan',
    silly: 'magenta',
    warn: 'yellow',
    error: 'red'
});

logger.configure({
    level: 'info',
    format,
    transports: [new logger.transports.Console()]
});

// set custom tokens for logging
morgan.token('req-details', (req: Request) => {
    return JSON.stringify({
        headers: req.headers,
        body: req.body,
        query: req.query,
        params: req.params
    });
});

morgan.token('real-ip', (req: Request) => {
    return req.get('x-real-ip') || '';
});

morgan.token('spawn-id', (req: Request) => {
    return req.get('spawn-id') || '';
});

morgan.token('origin-ip', (req: Request) => {
    return req.get('origin-ip') || '';
});

// success stream
const successStream = {
    write: (message) => logger.info(message)
};

// error stream
const errorStream = {
    write: (message) => logger.error(message)
};

const formatVerbose =
    ':real-ip :spawn-id :origin-ip :remote-user :method :url HTTP/:http-version - :status :res[content-type] :res[content-length] - :response-time ms REQUEST_DETAILS - :req-details';

const accessErrorLogger: any = morgan(formatVerbose, {
    skip: (req, res) => {
        return res.statusCode < 400;
    },
    stream: errorStream
});

const accessSuccessLogger: any = morgan(formatVerbose, {
    skip: (req, res) => {
        return res.statusCode >= 400;
    },
    stream: successStream
});

// env level filtering is disabled currently
logger.add(new SentryTransport({ level: 'error', handleExceptions: true }));

export { logger, accessSuccessLogger, accessErrorLogger };
