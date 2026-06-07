import { config } from 'dotenv';
import { Module } from '@nestjs/common';

config();
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { PostsModule } from './posts/posts.module';
import { OrdersModule } from './orders/orders.module';

const useMemoryDb = process.env.USE_MEMORY_DB === 'true';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ...(useMemoryDb
      ? []
      : [
          MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (config: ConfigService) => ({
              uri:
                config.get<string>('MONGODB_URI') ??
                'mongodb://localhost:27017/ecommerce',
              serverSelectionTimeoutMS: 5000,
            }),
            inject: [ConfigService],
          }),
        ]),
    ProductsModule.register(useMemoryDb),
    PostsModule.register(useMemoryDb),
    OrdersModule.register(useMemoryDb),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
