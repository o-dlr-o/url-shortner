import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ShortenedUrlEntity } from './shortened-url.entity';
import { TIMESTAMP_FORMAT } from '../../shared/config/app.config';

@Entity('url_calls')
export class UrlCallsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => ShortenedUrlEntity, (s) => s.urlCallsEntity)
  @JoinColumn()
  shortenUrl: ShortenedUrlEntity;

  @Column()
  counter: number;

  @UpdateDateColumn({
    type: TIMESTAMP_FORMAT,
    name: 'updated_at',
  })
  updatedAt?: string;
}
