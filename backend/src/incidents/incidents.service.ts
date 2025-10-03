import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Incident, IncidentType, IncidentSeverity } from './incidents.entity';
import { CreateIncidentDto } from './dto/create-incident.dto';

@Injectable()
export class IncidentsService {
  constructor(
    @InjectRepository(Incident)
    private incidentsRepository: Repository<Incident>,
  ) {}

  async create(createIncidentDto: CreateIncidentDto, userId: string): Promise<Incident> {
    // Check if there's already an incident at the same location with the same type
    const existingIncident = await this.incidentsRepository.findOne({
      where: {
        type: createIncidentDto.type,
        latitude: createIncidentDto.latitude,
        longitude: createIncidentDto.longitude,
        isResolved: false,
      },
    });

    if (existingIncident) {
      // Increment reporter count and add user to reporters
      existingIncident.reporterCount += 1;
      if (!existingIncident.reporterIds.includes(userId)) {
        existingIncident.reporterIds.push(userId);
      }
      return this.incidentsRepository.save(existingIncident);
    }

    // Create new incident
    const incident = this.incidentsRepository.create({
      ...createIncidentDto,
      reporterIds: [userId],
    });

    return this.incidentsRepository.save(incident);
  }

  async findAll(): Promise<Incident[]> {
    return this.incidentsRepository.find({
      where: { isResolved: false },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Incident> {
    const incident = await this.incidentsRepository.findOne({ where: { id } });
    if (!incident) {
      throw new NotFoundException(`Incident with ID ${id} not found`);
    }
    return incident;
  }

  async findByLocation(lat: number, lon: number, radiusKm: number = 10): Promise<Incident[]> {
    // Simple distance calculation (for production, use PostGIS or similar)
    const incidents = await this.incidentsRepository.find({
      where: { isResolved: false },
    });

    return incidents.filter(incident => {
      const distance = this.calculateDistance(
        lat, lon,
        incident.latitude, incident.longitude
      );
      return distance <= radiusKm;
    });
  }

  async resolve(id: string, userId: string): Promise<Incident> {
    const incident = await this.findOne(id);
    
    // Check if user is one of the reporters
    if (!incident.reporterIds.includes(userId)) {
      throw new NotFoundException('You can only resolve incidents you reported');
    }

    incident.isResolved = true;
    incident.resolvedAt = new Date();
    
    return this.incidentsRepository.save(incident);
  }

  async remove(id: string, userId: string): Promise<void> {
    const incident = await this.findOne(id);
    
    // Check if user is one of the reporters
    if (!incident.reporterIds.includes(userId)) {
      throw new NotFoundException('You can only remove incidents you reported');
    }

    await this.incidentsRepository.remove(incident);
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

