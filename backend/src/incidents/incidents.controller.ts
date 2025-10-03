import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface RequestWithUser extends Request {
  user: { id: string; username: string };
}

@Controller('incidents')
@UseGuards(JwtAuthGuard)
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Post()
  create(@Body() createIncidentDto: CreateIncidentDto, @Request() req: RequestWithUser) {
    return this.incidentsService.create(createIncidentDto, req.user.id);
  }

  @Get()
  findAll() {
    return this.incidentsService.findAll();
  }

  @Get('nearby')
  findByLocation(
    @Query('lat') lat: number,
    @Query('lon') lon: number,
    @Query('radius') radius: number = 10,
  ) {
    return this.incidentsService.findByLocation(lat, lon, radius);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.incidentsService.findOne(id);
  }

  @Post(':id/resolve')
  resolve(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.incidentsService.resolve(id, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.incidentsService.remove(id, req.user.id);
  }
}
