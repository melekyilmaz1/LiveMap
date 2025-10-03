import { IncidentsService } from './incidents.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
interface RequestWithUser extends Request {
    user: {
        id: string;
        username: string;
    };
}
export declare class IncidentsController {
    private readonly incidentsService;
    constructor(incidentsService: IncidentsService);
    create(createIncidentDto: CreateIncidentDto, req: RequestWithUser): Promise<import("./incidents.entity").Incident>;
    findAll(): Promise<import("./incidents.entity").Incident[]>;
    findByLocation(lat: number, lon: number, radius?: number): Promise<import("./incidents.entity").Incident[]>;
    findOne(id: string): Promise<import("./incidents.entity").Incident>;
    resolve(id: string, req: RequestWithUser): Promise<import("./incidents.entity").Incident>;
    remove(id: string, req: RequestWithUser): Promise<void>;
}
export {};
