import { IsEnum, IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { IncidentType, IncidentSeverity } from '../incidents.entity';

export class CreateIncidentDto {
  @IsEnum(IncidentType)
  type: IncidentType;

  @IsEnum(IncidentSeverity)
  severity: IncidentSeverity;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  image?: string; // Base64 encoded image
}

