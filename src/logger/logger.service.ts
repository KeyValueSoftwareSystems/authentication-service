import winston, { createLogger, format, transports } from 'winston';

export class LoggerService {
  private readonly winstonLogger: winston.Logger;
  private context: string;
  private static instance: LoggerService;

  private constructor(context: string) {
    this.winstonLogger = LoggerService.createWinstonLogger();
    this.context = context;
  }

  /**
   * Create the instance of the logger to be used across the application code.
   * @param {string} context The context of this logger instance to be printed.
   * @returns {LoggerService} The instance of the logger.
   */
  public static getInstance(context: string): LoggerService {
    LoggerService.instance = new LoggerService(context);
    return LoggerService.instance;
  }

  private static createWinstonLogger() {
    const logFormat = format.printf(
      (info) => `${info.level}: [${info.timestamp}]${info.message}`,
    );
    const transportList = [
      new transports.Console({
        format: format.combine(
          format.timestamp(),
          format.colorize(),
          logFormat,
        ),
      }),
    ];
    return createLogger({
      transports: transportList,
      exitOnError: false,
    });
  }

  private createLog(level: string, message: string) {
    const moduleName = this.context;
    const messageString =
      typeof message === 'object' && message
        ? JSON.stringify(message, null, 2)
        : message;
    this.winstonLogger.log(level, `[${moduleName}] ${messageString}`);
  }

  /**
   * * Methods for logging using the LoggerService instance.
   * Following methods are available:
   * debug, info, error, warn
   *
   * @param message The additional message that needs to be logged.
   */
  debug(message: any): void {
    this.createLog('debug', message);
  }

  info(message: any): void {
    this.createLog('info', message);
  }

  error(message: any): void {
    this.createLog('error', message);
  }

  warn(message: any): void {
    this.createLog('warn', message);
  }
}
