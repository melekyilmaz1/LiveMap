import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Server, WebSocket } from 'ws';
import { WsJwtGuard } from '../auth/ws-jwt.guard';
import { IncidentsService } from './incidents.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { IncidentType, IncidentSeverity } from './incidents.entity';

@WebSocketGateway({
  cors: {
    origin: "*",
  },
  path: '/incidents',
})
export class IncidentsGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly incidentsService: IncidentsService) {}

  // Basic WS protocol: expect JSON messages with {type, data}
  handleConnection(client: WebSocket) {
    client.send(JSON.stringify({ type: 'connected' }));
    // Dinleyici: gelen mesajları işle
    client.on('message', (data: any) => {
      try {
        const text = typeof data === 'string' ? data : data.toString('utf8');
        this.handleIncomingMessage(client, text);
      } catch {
        // ignore parse errors
      }
    });
  }

  private async handleIncomingMessage(client: WebSocket, payload: any) {
    try {
      const msg = typeof payload === 'string' ? JSON.parse(payload) : payload;
      const type = msg?.type;
      if (!type) return;

      switch (type) {
        case 'join_incidents': {
          // Artık otomatik tüm olayları göndermiyoruz; sadece bağlantı onayı
          client.send(JSON.stringify({ type: 'joined' }));
          break;
        }
        case 'new_incident': {
          const dto: CreateIncidentDto = {
            type: this.mapType(msg.data?.type),
            severity: this.mapSeverity(msg.data?.severity),
            latitude: Number(msg.data?.latitude ?? msg.data?.lat),
            longitude: Number(msg.data?.longitude ?? msg.data?.lon),
            description: msg.data?.description,
            image: msg.data?.image,
          } as any;
          const incident = await this.incidentsService.create(dto, String(msg.userId ?? '0'));
          this.broadcast({ type: 'incident_created', data: incident });
          break;
        }
        case 'remove_incident': {
          const id = msg.data?.id;
          if (id) {
            try {
              await this.incidentsService.remove(id, String(msg.userId ?? '0'));
            } catch {
              // yetki hatası vs. olsa bile, istemciler senkron kalsın diye yine yayınla
            }
            this.broadcast({ type: 'incident_removed', data: { id } });
          }
          break;
        }
      }
    } catch (e) {
      // ignore
    }
  }

  private broadcast(message: any) {
    const s = JSON.stringify(message);
    this.server.clients.forEach((c: WebSocket) => {
      if (c.readyState === WebSocket.OPEN) {
        c.send(s);
      }
    });
  }

  private mapType(v: any): IncidentType {
    const s = String(v || '').toLowerCase();
    switch (s) {
      case 'crash': return IncidentType.CRASH;
      case 'slowdown': return IncidentType.SLOWDOWN;
      case 'construction': return IncidentType.CONSTRUCTION;
      case 'lane closure':
      case 'lane_closure':
      case 'laneclosure': return IncidentType.LANE_CLOSURE;
      case 'object on road':
      case 'object_on_road':
      case 'objectonroad': return IncidentType.OBJECT_ON_ROAD;
      default: return IncidentType.CRASH;
    }
  }

  private mapSeverity(v: any): IncidentSeverity {
    const s = String(v || '').toLowerCase();
    switch (s) {
      case 'low': return IncidentSeverity.LOW;
      case 'high': return IncidentSeverity.HIGH;
      default: return IncidentSeverity.MEDIUM;
    }
  }
}

