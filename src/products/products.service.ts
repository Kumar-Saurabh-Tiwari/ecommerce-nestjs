import { Injectable, Logger, NotFoundException, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { productSeed } from '../data/product.seed';
import { ProductResponse } from './product.interface';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  private inMemoryProducts: ProductResponse[] = [...productSeed];
  private nextId =
    Math.max(...this.inMemoryProducts.map((p) => p.id), 0) + 1;

  constructor(
    @Optional()
    @InjectModel(Product.name)
    private readonly productModel?: Model<ProductDocument>,
  ) {}

  private toResponse(doc: ProductDocument | ProductResponse): ProductResponse {
    if ('legacyId' in doc && doc.legacyId !== undefined) {
      return {
        id: doc.legacyId,
        slug: doc.slug,
        image: doc.image,
        bannerImg: doc.bannerImg,
        category: doc.category,
        title: doc.title,
        author: doc.author,
        publishedDate: doc.publishedDate,
        price: doc.price,
        descripTion: doc.descripTion,
      };
    }
    return doc as ProductResponse;
  }

  private async getFromDb(): Promise<ProductResponse[] | null> {
    if (!this.productModel) return null;
    try {
      const docs = await this.productModel.find().lean().exec();
      if (docs.length === 0) return null;
      return docs.map((d) => this.toResponse(d as ProductDocument));
    } catch (err) {
      this.logger.warn(`MongoDB unavailable, using in-memory data: ${err}`);
      return null;
    }
  }

  async findAll(query?: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<ProductResponse[]> {
    const dbProducts = await this.getFromDb();
    let products = dbProducts ?? [...this.inMemoryProducts];

    if (query?.category) {
      products = products.filter(
        (p) => p.category.toLowerCase() === query.category!.toLowerCase(),
      );
    }

    if (query?.search) {
      const term = query.search.toLowerCase();
      products = products.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.category.toLowerCase().includes(term),
      );
    }

    if (query?.minPrice !== undefined) {
      products = products.filter(
        (p) => parseFloat(p.price) >= query.minPrice!,
      );
    }

    if (query?.maxPrice !== undefined) {
      products = products.filter(
        (p) => parseFloat(p.price) <= query.maxPrice!,
      );
    }

    return products;
  }

  async findBySlug(slug: string): Promise<ProductResponse> {
    const products = await this.findAll();
    const product = products.find((p) => p.slug === slug);
    if (!product) {
      throw new NotFoundException(`Product with slug "${slug}" not found`);
    }
    return product;
  }

  async findCategories(): Promise<string[]> {
    const products = await this.findAll();
    return [...new Set(products.map((p) => p.category))];
  }

  async create(dto: CreateProductDto): Promise<ProductResponse> {
    const slug =
      dto.slug ??
      dto.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const product: ProductResponse = {
      id: this.nextId++,
      slug,
      image: dto.image ?? '16.jpg',
      bannerImg: dto.bannerImg ?? dto.image ?? '16.jpg',
      category: dto.category ?? 'Business',
      title: dto.title,
      author: dto.author ?? 'Admin',
      publishedDate:
        dto.publishedDate ??
        new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
      price: dto.price,
      descripTion: dto.descripTion ?? '',
    };

    if (this.productModel) {
      try {
        await this.productModel.create({
          legacyId: product.id,
          slug: product.slug,
          image: product.image,
          bannerImg: product.bannerImg,
          category: product.category,
          title: product.title,
          author: product.author,
          publishedDate: product.publishedDate,
          price: product.price,
          descripTion: product.descripTion,
        });
      } catch (err) {
        this.logger.warn(`Could not save to MongoDB: ${err}`);
      }
    }

    this.inMemoryProducts.push(product);
    return product;
  }

  async remove(id: number): Promise<void> {
    const index = this.inMemoryProducts.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    this.inMemoryProducts.splice(index, 1);

    if (this.productModel) {
      try {
        await this.productModel.deleteOne({ legacyId: id });
      } catch (err) {
        this.logger.warn(`Could not delete from MongoDB: ${err}`);
      }
    }
  }
}
