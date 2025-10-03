"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncidentsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const ws_1 = require("ws");
const incidents_service_1 = require("./incidents.service");
const incidents_entity_1 = require("./incidents.entity");
let IncidentsGateway = class IncidentsGateway {
    incidentsService;
    server;
    constructor(incidentsService) {
        this.incidentsService = incidentsService;
    }
    handleConnection(client) {
        client.send(JSON.stringify({ type: 'connected' }));
        client.on('message', (data) => {
            try {
                const text = typeof data === 'string' ? data : data.toString('utf8');
                this.handleIncomingMessage(client, text);
            }
            catch {
            }
        });
    }
    async handleIncomingMessage(client, payload) {
        try {
            const msg = typeof payload === 'string' ? JSON.parse(payload) : payload;
            const type = msg?.type;
            if (!type)
                return;
            switch (type) {
                case 'join_incidents': {
                    client.send(JSON.stringify({ type: 'joined' }));
                    break;
                }
                case 'new_incident': {
                    const dto = {
                        type: this.mapType(msg.data?.type),
                        severity: this.mapSeverity(msg.data?.severity),
                        latitude: Number(msg.data?.latitude ?? msg.data?.lat),
                        longitude: Number(msg.data?.longitude ?? msg.data?.lon),
                        description: msg.data?.description,
                        image: msg.data?.image,
                    };
                    const incident = await this.incidentsService.create(dto, String(msg.userId ?? '0'));
                    this.broadcast({ type: 'incident_created', data: incident });
                    break;
                }
                case 'remove_incident': {
                    const id = msg.data?.id;
                    if (id) {
                        try {
                            await this.incidentsService.remove(id, String(msg.userId ?? '0'));
                        }
                        catch {
                        }
                        this.broadcast({ type: 'incident_removed', data: { id } });
                    }
                    break;
                }
            }
        }
        catch (e) {
        }
    }
    broadcast(message) {
        const s = JSON.stringify(message);
        this.server.clients.forEach((c) => {
            if (c.readyState === ws_1.WebSocket.OPEN) {
                c.send(s);
            }
        });
    }
    mapType(v) {
        const s = String(v || '').toLowerCase();
        switch (s) {
            case 'crash': return incidents_entity_1.IncidentType.CRASH;
            case 'slowdown': return incidents_entity_1.IncidentType.SLOWDOWN;
            case 'construction': return incidents_entity_1.IncidentType.CONSTRUCTION;
            case 'lane closure':
            case 'lane_closure':
            case 'laneclosure': return incidents_entity_1.IncidentType.LANE_CLOSURE;
            case 'object on road':
            case 'object_on_road':
            case 'objectonroad': return incidents_entity_1.IncidentType.OBJECT_ON_ROAD;
            default: return incidents_entity_1.IncidentType.CRASH;
        }
    }
    mapSeverity(v) {
        const s = String(v || '').toLowerCase();
        switch (s) {
            case 'low': return incidents_entity_1.IncidentSeverity.LOW;
            case 'high': return incidents_entity_1.IncidentSeverity.HIGH;
            default: return incidents_entity_1.IncidentSeverity.MEDIUM;
        }
    }
};
exports.IncidentsGateway = IncidentsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", ws_1.Server)
], IncidentsGateway.prototype, "server", void 0);
exports.IncidentsGateway = IncidentsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: "*",
        },
        path: '/incidents',
    }),
    __metadata("design:paramtypes", [incidents_service_1.IncidentsService])
], IncidentsGateway);
//# sourceMappingURL=incidents.gateway.js.map