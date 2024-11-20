import { IsNotEmpty, IsString, IsNumber, IsUUID, Min } from 'class-validator';

export class CreateInventoryItemDto {
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  size: string;

  @IsString()
  @IsNotEmpty()
  color: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsNumber()
  @Min(0)
  lowStockThreshold: number;
}
