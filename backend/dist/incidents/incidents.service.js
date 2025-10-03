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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncidentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const incidents_entity_1 = require("./incidents.entity");
let IncidentsService = class IncidentsService {
    incidentsRepository;
    constructor(incidentsRepository) {
        this.incidentsRepository = incidentsRepository;
    }
    async create(createIncidentDto, userId) {
        const existingIncident = await this.incidentsRepository.findOne({
            where: {
                type: createIncidentDto.type,
                latitude: createIncidentDto.latitude,
                longitude: createIncidentDto.longitude,
                isResolved: false,
            },
        });
        if (existingIncident) {
            existingIncident.reporterCount += 1;
            if (!existingIncident.reporterIds.includes(userId)) {
                existingIncident.reporterIds.push(userId);
            }
            return this.incidentsRepository.save(existingIncident);
        }
        const incident = this.incidentsRepository.create({
            ...createIncidentDto,
            reporterIds: [userId],
        });
        return this.incidentsRepository.save(incident);
    }
    async findAll() {
        return this.incidentsRepository.find({
            where: { isResolved: false },
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const incident = await this.incidentsRepository.findOne({ where: { id } });
        if (!incident) {
            throw new common_1.NotFoundException(`Incident with ID ${id} not found`);
        }
        return incident;
    }
    async findByLocation(lat, lon, radiusKm = 10) {
        const incidents = await this.incidentsRepository.find({
            where: { isResolved: false },
        });
        return incidents.filter(incident => {
            const distance = this.calculateDistance(lat, lon, incident.latitude, incident.longitude);
            return distance <= radiusKm;
        });
    }
    async resolve(id, userId) {
        const incident = await this.findOne(id);
        if (!incident.reporterIds.includes(userId)) {
            throw new common_1.NotFoundException('You can only resolve incidents you reported');
        }
        incident.isResolved = true;
        incident.resolvedAt = new Date();
        return this.incidentsRepository.save(incident);
    }
    async remove(id, userId) {
        const incident = await this.findOne(id);
        if (!incident.reporterIds.includes(userId)) {
            throw new common_1.NotFoundException('You can only remove incidents you reported');
        }
        await this.incidentsRepository.remove(incident);
    }
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    deg2rad(deg) {
        return deg * (Math.PI / 180);
    }
};
exports.IncidentsService = IncidentsService;
exports.IncidentsService = IncidentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(incidents_entity_1.Incident)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], IncidentsService);
//# sourceMappingURL=incidents.service.js.map