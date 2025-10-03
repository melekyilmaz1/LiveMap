export declare enum IncidentType {
    CRASH = "crash",
    SLOWDOWN = "slowdown",
    CONSTRUCTION = "construction",
    LANE_CLOSURE = "laneClosure",
    OBJECT_ON_ROAD = "objectOnRoad"
}
export declare enum IncidentSeverity {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high"
}
export declare class Incident {
    id: string;
    type: IncidentType;
    severity: IncidentSeverity;
    latitude: number;
    longitude: number;
    description: string;
    image: string;
    reporterCount: number;
    reporterIds: string[];
    createdAt: Date;
    updatedAt: Date;
    isResolved: boolean;
    resolvedAt: Date;
}
