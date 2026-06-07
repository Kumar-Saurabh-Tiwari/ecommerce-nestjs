import { DynamicModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order, OrderSchema } from './schemas/order.schema';

@Module({})
export class OrdersModule {
  static register(useMemoryDb: boolean): DynamicModule {
    return {
      module: OrdersModule,
      imports: useMemoryDb
        ? []
        : [MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }])],
      controllers: [OrdersController],
      providers: [OrdersService],
      exports: [OrdersService],
    };
  }
}
