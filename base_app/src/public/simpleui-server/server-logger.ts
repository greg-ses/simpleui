export enum LogLevel {
    EMERGENCY,
    ALERT,
    CRITICAL,
    ERROR,
    WARNING,
    NOTICE,
    INFO,
    DEBUG,
    VERBOSE
}

export const DisplayLogLevel = {
    'EMERGENCY': LogLevel.EMERGENCY,
    'ALERT': LogLevel.ALERT,
    'CRITICAL': LogLevel.CRITICAL,
    'ERROR': LogLevel.ERROR,
    'WARNING': LogLevel.WARNING,
    'NOTICE': LogLevel.NOTICE,
    'INFO': LogLevel.INFO,
    'DEBUG': LogLevel.DEBUG,
    'VERBOSE': LogLevel.VERBOSE
};

export class Logger {

    public static logLevel = LogLevel.DEBUG;

    public static log(logLevel: LogLevel, message: string) {
        if (logLevel <= Logger.logLevel) {
            console.log(message);
        }
    }

    public static getDisplayLogLevel() {
        let displayLogLevel = `Invalid LogLevel: ${Logger.logLevel}`;
        for (const key of Object.keys(DisplayLogLevel)) {
            if (Logger.logLevel === DisplayLogLevel[key]) {
                displayLogLevel = key;
                break;
            }
        }
        return displayLogLevel;
    }

    public static setLogLevel(newLogLevel: string): boolean {
        let success = false;
        if (Object.keys(DisplayLogLevel).indexOf(newLogLevel) > -1) {
            Logger.log(LogLevel.INFO, `LogLevel changed from: ${Logger.getDisplayLogLevel()} to : ${newLogLevel}`);
            Logger.logLevel = DisplayLogLevel[newLogLevel];
            success = true;
        }
        return success;
    }
}