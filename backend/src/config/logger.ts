import winston from "winston";

const { combine, timestamp, printf, colorize } = winston.format;

const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

// logger instance
export const logger = winston.createLogger({
  level: "debug",
  format: combine(colorize(), timestamp(), myFormat),
  transports: [new winston.transports.Console()],
});

export const log = {
  info: (msg: string) => logger.info(msg),
  warn: (msg: string) => logger.warn(msg),
  error: (msg: string) => logger.error(msg),
  debug: (msg: string) => logger.debug(msg),
};


/**
 * Usage 
 * log.info("Job Scraper Started"),
 * log.error("Job Scraper Failed"),
 * log.debug("Job Scraper Completed"),
 * log.warn("Job Scraper Paused"),
 */