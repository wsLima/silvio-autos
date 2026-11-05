import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { ListingStatus } from '../../generated/prisma/enums.js';

function parseJsonArray(value: unknown): unknown {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : value;
    } catch {
      return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }
  return value;
}

function parseBoolean(value: unknown): unknown {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value === 'true' || value === '1';
  return value;
}

export class CreateListingDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsString()
  @MinLength(1)
  brand!: string;

  @IsString()
  @MinLength(1)
  model!: string;

  @Type(() => Number)
  @IsInt()
  year!: number;

  @Type(() => Number)
  @IsInt()
  manufacturingYear!: number;

  @IsString()
  @MinLength(1)
  locality!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  mileage!: number;

  @IsString()
  @MinLength(1)
  description!: string;

  @Transform(({ value }) => parseJsonArray(value))
  @IsArray()
  @IsString({ each: true })
  features!: string[];

  @IsOptional()
  @IsEnum(ListingStatus)
  status?: ListingStatus;

  @IsOptional()
  @Transform(({ value }) => parseBoolean(value))
  @IsBoolean()
  isHighlight?: boolean;

  @IsString()
  @MinLength(1)
  contactName!: string;

  @IsString()
  @MinLength(1)
  contactPhone!: string;

  @IsString()
  @MinLength(1)
  contactWhatsapp!: string;

  @IsEmail()
  contactEmail!: string;
}
