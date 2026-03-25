import { IsString, IsNumber, IsOptional, IsBoolean, Min, IsObject } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name!: string;

  @IsString()
  description!: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsString()
  imageUrl!: string;

  @IsString()
  category!: string;

  @IsNumber()
  @Min(0)
  stock!: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsObject()
  technicalSpecs?: Record<string, string>;

  @IsString()
  invimaRegistry!: string;
}
