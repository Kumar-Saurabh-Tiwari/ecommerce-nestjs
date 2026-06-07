import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, unique: true })
  legacyId: number;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true })
  image: string;

  @Prop({ required: true })
  bannerImg: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  author: string;

  @Prop({ required: true })
  publishedDate: string;

  @Prop({ required: true })
  price: string;

  @Prop({ required: true })
  descripTion: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
