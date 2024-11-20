import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { UsersService } from '../users/users.service';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemsRepository: Repository<OrderItem>,
    private readonly usersService: UsersService,
    private readonly inventoryService: InventoryService,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const user = await this.usersService.findOne(createOrderDto.userId);

    // Create new order
    const order = this.ordersRepository.create({
      user,
      shippingAddress: createOrderDto.shippingAddress,
      totalAmount: 0,
    });

    // Calculate total and create order items
    let totalAmount = 0;
    const orderItems: OrderItem[] = [];

    for (const item of createOrderDto.items) {
      const inventoryItem = await this.inventoryService.findOne(
        item.inventoryItemId,
      );

      // Check stock availability
      if (inventoryItem.quantity < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product ${inventoryItem.product.name}`,
        );
      }

      // Update inventory
      await this.inventoryService.updateQuantity(
        item.inventoryItemId,
        -item.quantity,
      );

      // Create order item
      const orderItem = this.orderItemsRepository.create({
        order,
        inventoryItem,
        quantity: item.quantity,
        price: inventoryItem.product.price,
        subtotal: inventoryItem.product.price * item.quantity,
      });

      totalAmount += orderItem.subtotal;
      orderItems.push(orderItem);
    }

    order.totalAmount = totalAmount;
    order.items = orderItems;

    return this.ordersRepository.save(order);
  }

  async findAll(): Promise<Order[]> {
    return this.ordersRepository.find({
      relations: [
        'user',
        'items',
        'items.inventoryItem',
        'items.inventoryItem.product',
      ],
    });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: [
        'user',
        'items',
        'items.inventoryItem',
        'items.inventoryItem.product',
      ],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);
    Object.assign(order, updateOrderDto);
    return this.ordersRepository.save(order);
  }

  async remove(id: string): Promise<void> {
    const order = await this.findOne(id);
    await this.ordersRepository.remove(order);
  }

  async findByUser(userId: string): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { user: { id: userId } },
      relations: [
        'items',
        'items.inventoryItem',
        'items.inventoryItem.product',
      ],
    });
  }
}
