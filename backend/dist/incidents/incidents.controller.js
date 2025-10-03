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
exports.IncidentsController = void 0;
const common_1 = require("@nestjs/common");
const incidents_service_1 = require("./incidents.service");
const create_incident_dto_1 = require("./dto/create-incident.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let IncidentsController = class IncidentsController {
    incidentsService;
    constructor(incidentsService) {
        this.incidentsService = incidentsService;
    }
    create(createIncidentDto, req) {
        return this.incidentsService.create(createIncidentDto, req.user.id);
    }
    findAll() {
        return this.incidentsService.findAll();
    }
    findByLocation(lat, lon, radius = 10) {
        return this.incidentsService.findByLocation(lat, lon, radius);
    }
    findOne(id) {
        return this.incidentsService.findOne(id);
    }
    resolve(id, req) {
        return this.incidentsService.resolve(id, req.user.id);
    }
    remove(id, req) {
        return this.incidentsService.remove(id, req.user.id);
    }
};
exports.IncidentsController = IncidentsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_incident_dto_1.CreateIncidentDto, Object]),
    __metadata("design:returntype", void 0)
], IncidentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], IncidentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('nearby'),
    __param(0, (0, common_1.Query)('lat')),
    __param(1, (0, common_1.Query)('lon')),
    __param(2, (0, common_1.Query)('radius')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number]),
    __metadata("design:returntype", void 0)
], IncidentsController.prototype, "findByLocation", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], IncidentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/resolve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], IncidentsController.prototype, "resolve", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], IncidentsController.prototype, "remove", null);
exports.IncidentsController = IncidentsController = __decorate([
    (0, common_1.Controller)('incidents'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [incidents_service_1.IncidentsService])
], IncidentsController);
//# sourceMappingURL=incidents.controller.js.map