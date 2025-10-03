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
exports.Incident = exports.IncidentSeverity = exports.IncidentType = void 0;
const typeorm_1 = require("typeorm");
var IncidentType;
(function (IncidentType) {
    IncidentType["CRASH"] = "crash";
    IncidentType["SLOWDOWN"] = "slowdown";
    IncidentType["CONSTRUCTION"] = "construction";
    IncidentType["LANE_CLOSURE"] = "laneClosure";
    IncidentType["OBJECT_ON_ROAD"] = "objectOnRoad";
})(IncidentType || (exports.IncidentType = IncidentType = {}));
var IncidentSeverity;
(function (IncidentSeverity) {
    IncidentSeverity["LOW"] = "low";
    IncidentSeverity["MEDIUM"] = "medium";
    IncidentSeverity["HIGH"] = "high";
})(IncidentSeverity || (exports.IncidentSeverity = IncidentSeverity = {}));
let Incident = class Incident {
    id;
    type;
    severity;
    latitude;
    longitude;
    description;
    image;
    reporterCount;
    reporterIds;
    createdAt;
    updatedAt;
    isResolved;
    resolvedAt;
};
exports.Incident = Incident;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Incident.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: IncidentType,
        default: IncidentType.CRASH
    }),
    __metadata("design:type", String)
], Incident.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: IncidentSeverity,
        default: IncidentSeverity.MEDIUM
    }),
    __metadata("design:type", String)
], Incident.prototype, "severity", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 8 }),
    __metadata("design:type", Number)
], Incident.prototype, "latitude", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 11, scale: 8 }),
    __metadata("design:type", Number)
], Incident.prototype, "longitude", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], Incident.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], Incident.prototype, "image", void 0);
__decorate([
    (0, typeorm_1.Column)('int', { default: 1 }),
    __metadata("design:type", Number)
], Incident.prototype, "reporterCount", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata("design:type", Array)
], Incident.prototype, "reporterIds", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Incident.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Incident.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)('boolean', { default: false }),
    __metadata("design:type", Boolean)
], Incident.prototype, "isResolved", void 0);
__decorate([
    (0, typeorm_1.Column)('timestamp', { nullable: true }),
    __metadata("design:type", Date)
], Incident.prototype, "resolvedAt", void 0);
exports.Incident = Incident = __decorate([
    (0, typeorm_1.Entity)('incidents')
], Incident);
//# sourceMappingURL=incidents.entity.js.map