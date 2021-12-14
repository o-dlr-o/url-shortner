import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Max, Min } from 'class-validator';

export class PaginationQuery {
  @Type(() => Number)
  @IsOptional()
  @IsPositive()
  @Max(100)
  limit = 10;

  @Type(() => Number)
  @IsOptional()
  @Min(0)
  offset? = 0;
}
