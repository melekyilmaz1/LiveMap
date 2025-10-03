import { Server, WebSocket } from 'ws';
import { IncidentsService } from './incidents.service';
export declare class IncidentsGateway {
    private readonly incidentsService;
    server: Server;
    constructor(incidentsService: IncidentsService);
    handleConnection(client: WebSocket): void;
    private handleIncomingMessage;
    private broadcast;
    private mapType;
    private mapSeverity;
}
