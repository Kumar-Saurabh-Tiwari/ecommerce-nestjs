import { DynamicModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product, ProductSchema } from './schemas/product.schema';

@Module({})
export class ProductsModule {
  static register(useMemoryDb: boolean): DynamicModule {
    return {
      module: ProductsModule,
      imports: useMemoryDb
        ? []
        : [MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }])],
      controllers: [ProductsController],
      providers: [ProductsService],
      exports: [ProductsService],
    };
  }
}
