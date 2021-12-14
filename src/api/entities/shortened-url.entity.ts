import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { TIMESTAMP_FORMAT } from '../../shared/config/app.config';
import { UrlCallsEntity } from './url-calls.entity';

@Entity('shortened_url')
@Unique(['url', 'hash'])
export class ShortenedUrlEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  hash: string;

  @Column()
  url: string;

  @OneToOne(() => UrlCallsEntity, (c) => c.shortenUrl, { eager: true })
  urlCallsEntity: UrlCallsEntity;

  @CreateDateColumn({
    type: TIMESTAMP_FORMAT,
    name: 'created_at',
  })
  createdAt?: string;

  @UpdateDateColumn({
    type: TIMESTAMP_FORMAT,
    name: 'updated_at',
  })
  updatedAt?: string;
}
