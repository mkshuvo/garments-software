import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { InventoryItem } from './entities/inventory-item.entity';
import { ProductsService } from '../products/products.service';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryItem)
    private readonly inventoryRepository: Repository<InventoryItem>,
    private readonly productsService: ProductsService,
  ) {}

  async create(createInventoryItemDto: CreateInventoryItemDto): Promise<InventoryItem> {
    const product = await this.productsService.findOne(createInventoryItemDto.productId);
    
    const inventoryItem = this.inventoryRepository.create({
      ...createInventoryItemDto,
      product,
      isLowStock: createInventoryItemDto.quantity <= createInventoryItemDto.lowStockThreshold,
    });

    return this.inventoryRepository.save(inventoryItem);
  }

  async findAll(): Promise<InventoryItem[]> {
    return this.inventoryRepository.find({
      relations: ['product'],
    });
  }

  async findOne(id: string): Promise<InventoryItem> {
    const inventoryItem = await this.inventoryRepository.findOne({
      where: { id },
      relations: ['product'],
    });

    if (!inventoryItem) {
      throw new NotFoundException('Inventory item not found');
    }

    return inventoryItem;
  }

  async update(id: string, updateInventoryItemDto: UpdateInventoryItemDto): Promise<InventoryItem> {
    const inventoryItem = await this.findOne(id);

    if (updateInventoryItemDto.productId) {
      const product = await this.productsService.findOne(updateInventoryItemDto.productId);
      inventoryItem.product = product;
    }

    Object.assign(inventoryItem, updateInventoryItemDto);
    
    // Update low stock status
    if (updateInventoryItemDto.quantity !== undefined || updateInventoryItemDto.lowStockThreshold !== undefined) {
      inventoryItem.isLowStock = inventoryItem.quantity <= inventoryItem.lowStockThreshold;
    }

    return this.inventoryRepository.save(inventoryItem);
  }

  async remove(id: string): Promise<void> {
    const inventoryItem = await this.findOne(id);
    await this.inventoryRepository.remove(inventoryItem);
  }

  async getLowStockItems(): Promise<InventoryItem[]> {
    return this.inventoryRepository.find({
      where: { isLowStock: true },
      relations: ['product'],
    });
  }

  async updateQuantity(id: string, quantityChange: number): Promise<InventoryItem> {
    const inventoryItem = await this.findOne(id);
    inventoryItem.quantity += quantityChange;
    
    if (inventoryItem.quantity < 0) {
      throw new Error('Insufficient stock');
    }

    inventoryItem.isLowStock = inventoryItem.quantity <= inventoryItem.lowStockThreshold;
    return this.inventoryRepository.save(inventoryItem);
  }
}
