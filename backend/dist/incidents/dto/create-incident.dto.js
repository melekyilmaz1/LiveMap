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
exports.CreateIncidentDto = void 0;
const class_validator_1 = require("class-validator");
const incidents_entity_1 = require("../incidents.entity");
class CreateIncidentDto {
    type;
    severity;
    latitude;
    longitude;
    description;
    image;
}
exports.CreateIncidentDto = CreateIncidentDto;
__decorate([
    (0, class_validator_1.IsEnum)(incidents_entity_1.IncidentType),
    __metadata("design:type", String)
], CreateIncidentDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(incidents_entity_1.IncidentSeverity),
    __metadata("design:type", String)
], CreateIncidentDto.prototype, "severity", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-90),
    (0, class_validator_1.Max)(90),
    __metadata("design:type", Number)
], CreateIncidentDto.prototype, "latitude", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-180),
    (0, class_validator_1.Max)(180),
    __metadata("design:type", Number)
], CreateIncidentDto.prototype, "longitude", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateIncidentDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateIncidentDto.prototype, "image", void 0);
//# sourceMappingURL=create-incident.dto.js.map