import { Injectable } from '@angular/core';
import { Login } from 'src/app/auth/+state/auth.actions';
import { BackendErrorCodes } from './BackendErrorCodes';
import { LogEntry } from './LogEntry';
import { LogLevel } from './LogLevel';
import { LogPublisher } from './LogPublisher';
import { LogPublishersService } from './LogPublishersService';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class LogService {
    level: LogLevel;
    logWithDate = true;
    publishers: LogPublisher[];

    constructor(private publishersService: LogPublishersService, private backendErrorCode: BackendErrorCodes) {
        this.publishers = this.publishersService.publishers;
        switch (environment.name) {
            case 'production':
                this.level = LogLevel.Info;
                break;
            default:
                this.level = LogLevel.Debug;
                break;
        }
    }

    debug(msg: string, ...optionalParams: any[]) {
        this.writeToLog(msg, LogLevel.Debug, optionalParams);
    }

    info(msg: string, ...optionalParams: any[]) {
        this.writeToLog(msg, LogLevel.Info, optionalParams);
    }

    error(msg: string, ...optionalParams: any[]) {
        this.writeToLog(msg, LogLevel.Error, optionalParams);
    }

    private writeToLog(msg: string, level: LogLevel, params: any[]) {
        if (this.shouldLog(level)) {
            const entry = new LogEntry();
            entry.message = msg;
            entry.level = level;
            // Removing password from Login Action params
            if (params && params.length > 0
                && params[0] instanceof Login && params[0].password) {
                    entry.extraInfo[0] = { ...params[0] };
                    delete entry.extraInfo[0].password;
            } else {
                entry.extraInfo = params;
            }
            if (level === LogLevel.Error && this.backendErrorCode.isBackendHandledError(entry)) {
                entry.level = LogLevel.Debug;
            }
            for (const logger of this.publishers) {
                logger.log(entry).subscribe();
            }
        }
    }

    private shouldLog(level: LogLevel): boolean {
        return level >= this.level;
    }

}

