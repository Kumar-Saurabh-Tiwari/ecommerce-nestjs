export class CreateProductDto {
  title: string;
  slug?: string;
  image?: string;
  bannerImg?: string;
  category?: string;
  author?: string;
  publishedDate?: string;
  price: string;
  descripTion?: string;
}
