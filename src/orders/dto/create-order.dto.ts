export class OrderItemDto {
  productId: number;
  title: string;
  price: number;
  quantity: number;
  image?: string;
}

export class CreateOrderDto {
  customerName: string;
  email: string;
  phone?: string;
  address: string;
  items: OrderItemDto[];
  total: number;
}
