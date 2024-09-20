import winston from 'winston';
import config from '../config.js';

const customLevels = {
    levels: {
        fatal: 0,
        error: 1,
        warning: 2,
        info: 3,
        http: 4,
        debug: 5,
    },

    colors: {
        fatal: "red",
        error: "red",
        warning: "yellow",
        info: "blue",
        http: "cyan",
        debug: "green",
    },
};

const devLogger = winston.createLogger({
    levels: customLevels.levels,
    transports: [
        new winston.transports.Console({
            level: "debug", // log debug
            format: winston.format.combine(
                winston.format.colorize({ colors: customLevels.colors }),
                winston.format.timestamp({ format: "DD-MM-YYYY HH:mm:ss" }),
                winston.format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
            ),
        }),
    ],
});

const prodLogger = winston.createLogger({
    levels: customLevels.levels,
    transports: [
        new winston.transports.Console({
            level: "info", // log a consola a partir de info
            format: winston.format.combine(
                winston.format.colorize({ colors: customLevels.colors }),
                winston.format.timestamp({ format: "DD-MM-YYYY HH:mm:ss" }),
                winston.format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
            ),
        }),
        new winston.transports.File({
            filename: `${config.DIRNAME}/logs/errors.logs`,
            level: "error", // log a archivo a partir de error
            format: winston.format.combine(
                winston.format.timestamp({ format: "DD-MM-YYYY HH:mm:ss" }),
                winston.format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
            ),
        }),
    ],
});

const addLogger = (req, res, next) => {
    // req.logger = devLogger;
    req.logger = config.MODE === 'dev' ? devLogger : prodLogger;
    next();
}

export default addLogger;