export type OrderStatus = 'PENDING_PAYMENT' | 'PAYMENT_UNDER_REVIEW' | 'PAID' | 'REJECTED' | 'CANCELLED';

export interface OrderItem {
  productId: string;
  title: string;
  pricePaise: number;
  currency: 'INR';
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalPaise: number;
  currency: 'INR';
  createdAt: string;
  items: OrderItem[];
  paymentReference?: string;
}

export interface CreateOrderRequest {
  productIds: string[];
}

export interface SubmitPaymentReferenceRequest {
  utrReference: string;
  screenshot?: File;
}

export interface OrderPageResponse {
  content: CustomerOrder[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
