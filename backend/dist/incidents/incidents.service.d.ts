import { Repository } from 'typeorm';
import { Incident } from './incidents.entity';
import { CreateIncidentDto } from './dto/create-incident.dto';
export declare class IncidentsService {
    private incidentsRepository;
    constructor(incidentsRepository: Repository<Incident>);
    create(createIncidentDto: CreateIncidentDto, userId: string): Promise<Incident>;
    findAll(): Promise<Incident[]>;
    findOne(id: string): Promise<Incident>;
    findByLocation(lat: number, lon: number, radiusKm?: number): Promise<Incident[]>;
    resolve(id: string, userId: string): Promise<Incident>;
    remove(id: string, userId: string): Promise<void>;
    private calculateDistance;
    private deg2rad;
}
