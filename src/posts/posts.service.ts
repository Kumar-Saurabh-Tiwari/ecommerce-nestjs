import { Injectable, Logger, NotFoundException, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { postsSeed } from '../data/posts.seed';
import { PostResponse } from './post.interface';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);
  private inMemoryPosts: PostResponse[] = [...postsSeed];

  constructor(
    @Optional()
    @InjectModel(Post.name)
    private readonly postModel?: Model<PostDocument>,
  ) {}

  private toResponse(doc: PostDocument | PostResponse): PostResponse {
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
        descripTion: doc.descripTion,
      };
    }
    return doc as PostResponse;
  }

  private async getFromDb(): Promise<PostResponse[] | null> {
    if (!this.postModel) return null;
    try {
      const docs = await this.postModel.find().lean().exec();
      if (docs.length === 0) return null;
      return docs.map((d) => this.toResponse(d as PostDocument));
    } catch (err) {
      this.logger.warn(`MongoDB unavailable, using in-memory posts: ${err}`);
      return null;
    }
  }

  async findAll(): Promise<PostResponse[]> {
    const dbPosts = await this.getFromDb();
    return dbPosts ?? [...this.inMemoryPosts];
  }

  async findBySlug(slug: string): Promise<PostResponse> {
    const posts = await this.findAll();
    const post = posts.find((p) => p.slug === slug);
    if (!post) {
      throw new NotFoundException(`Post with slug "${slug}" not found`);
    }
    return post;
  }
}
