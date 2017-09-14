import { Injectable } from '@angular/core';
import { DatabaseMetadata } from './database-metadata';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { LoggerService } from '../utils/logger/logger.service';
import { Subscription } from 'rxjs/Subscription';
import { WebSocketSubject } from 'rxjs/observable/dom/WebSocketSubject';
import { Subject } from 'rxjs/Subject';
import { Filter } from '../common/filters/filters';
import { ConfigurationService } from "../configuration.service";
import 'rxjs/add/operator/filter'

export const enum DatabaseServiceActions {
    MetadataAction   = 'meta',
    ColumnInfoAction = 'columnInfo',
    SearchAction     = 'search',
    MessageAction    = 'message'
}

export const enum DatabaseServiceResponseStatusType {
    Success = 'success',
    Warning = 'warning',
    Error   = 'error'
}

export class DatabaseServiceRequestMessage {
    action?: string;
    data?: any;
}

@Injectable()
export class DatabaseService {
    private connection: WebSocketSubject<Object>;
    private subscription: Subscription;
    private messages: Subject<any> = new Subject();
    private metadata: ReplaySubject<DatabaseMetadata> = new ReplaySubject(1);

    constructor(private logger: LoggerService, private configuration: ConfigurationService) {
        this.connection = WebSocketSubject.create(configuration.websocketPrefix + '/api/database/connect');
        this.subscription = this.connection.subscribe({
            next: (message: any) => {
                let status = message.status;
                let action = message.action;
                switch (action) {
                    case DatabaseServiceActions.MetadataAction:
                        if (status === DatabaseServiceResponseStatusType.Success) {
                            this.metadata.next(DatabaseMetadata.deserialize(message.metadata))
                        } else {
                            this.logger.error('Database service', 'Bad metadata response', true);
                        }
                        break;
                    case DatabaseServiceActions.SearchAction:
                        this.messages.next(message);
                        logger.debug('Search', message);
                        break;
                    case DatabaseServiceActions.MessageAction:
                        if (message.message !== 'pong') {
                            logger.debug('Message', message);
                        }
                        break;
                    default:
                        logger.error('Unknown action in websocket', action)
                }
            }
        });
        this.sendMessage({ action: DatabaseServiceActions.MetadataAction });
        setInterval(() => {
            this.sendMessage({ action: 'ping' });
        }, 10000);
    }

    filter(filters: Filter[]) {
        this.sendMessage({
            action: DatabaseServiceActions.SearchAction,
            data: {
                filters: filters
            }
        });
    }

    getMessages(action: DatabaseServiceActions): Observable<any> {
        return this.messages.filter((message: any) => message.action === action && message.status === DatabaseServiceResponseStatusType.Success);
    }

    sendMessage(message: DatabaseServiceRequestMessage) {
        this.connection.next(JSON.stringify(message));
    }

    getMetadata(): Observable<DatabaseMetadata> {
        return this.metadata;
    }
}