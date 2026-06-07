import { Injectable, Logger, NotFoundException, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  private inMemoryOrders: Array<Order & { id: string }> = [];
  private nextOrderId = 1;

  constructor(
    @Optional()
    @InjectModel(Order.name)
    private readonly orderModel?: Model<OrderDocument>,
  ) {}

  async findAll() {
    if (this.orderModel) {
      try {
        const orders = await this.orderModel.find().sort({ createdAt: -1 }).lean().exec();
        if (orders.length > 0) {
          return orders.map((o) => ({
            ...o,
            id: o._id.toString(),
          }));
        }
      } catch (err) {
        this.logger.warn(`MongoDB unavailable for orders: ${err}`);
      }
    }
    return this.inMemoryOrders;
  }

  async findOne(id: string) {
    const orders = await this.findAll();
    const order = orders.find((o) => o.id === id || (o as { _id?: { toString: () => string } })._id?.toString() === id);
    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }
    return order;
  }

  async create(dto: CreateOrderDto) {
    const orderData = {
      customerName: dto.customerName,
      email: dto.email,
      phone: dto.phone,
      address: dto.address,
      items: dto.items,
      total: dto.total,
      status: 'pending',
    };

    if (this.orderModel) {
      try {
        const created = await this.orderModel.create(orderData);
        return { id: created._id.toString(), ...orderData };
      } catch (err) {
        this.logger.warn(`Could not save order to MongoDB: ${err}`);
      }
    }

    const order = { id: String(this.nextOrderId++), ...orderData };
    this.inMemoryOrders.unshift(order);
    return order;
  }
}
