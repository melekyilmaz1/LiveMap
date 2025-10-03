import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum IncidentType {
  CRASH = 'crash',
  SLOWDOWN = 'slowdown',
  CONSTRUCTION = 'construction',
  LANE_CLOSURE = 'laneClosure',
  OBJECT_ON_ROAD = 'objectOnRoad'
}

export enum IncidentSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

@Entity('incidents')
export class Incident {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: IncidentType,
    default: IncidentType.CRASH
  })
  type: IncidentType;

  @Column({
    type: 'enum',
    enum: IncidentSeverity,
    default: IncidentSeverity.MEDIUM
  })
  severity: IncidentSeverity;

  @Column('decimal', { precision: 10, scale: 8 })
  latitude: number;

  @Column('decimal', { precision: 11, scale: 8 })
  longitude: number;

  @Column('text', { nullable: true })
  description: string;

  @Column('text', { nullable: true })
  image: string; // Base64 encoded image

  @Column('int', { default: 1 })
  reporterCount: number;

  @Column('simple-array', { nullable: true })
  reporterIds: string[]; // Array of user IDs who reported this incident

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column('boolean', { default: false })
  isResolved: boolean;

  @Column('timestamp', { nullable: true })
  resolvedAt: Date;
}

