import { IncidentType, IncidentSeverity } from '../incidents.entity';
export declare class CreateIncidentDto {
    type: IncidentType;
    severity: IncidentSeverity;
    latitude: number;
    longitude: number;
    description?: string;
    image?: string;
}
