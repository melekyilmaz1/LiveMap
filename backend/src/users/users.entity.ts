import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 120, nullable: true })
  name: string;

  @Column({ unique: true, nullable: true })
  email: string;

  // Çoğu projede güvenlik için select:false
  @Column({ name: 'password_hash', select: false, nullable: true })
  passwordHash: string;
}
