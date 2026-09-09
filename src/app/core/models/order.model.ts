export interface CartItem {
  productId: string;
  name: string;
  image: string;
  unitPrice: number;
  quantity: number;
  maxQuantity: number;
  sku: string;
}

export interface WishlistItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  addedAt: string;
}

export interface Address {
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export type DeliveryMethod = 'Standard Delivery' | 'Express Delivery' | 'Store Pickup';

export type PaymentMethod = 'Cash on Delivery' | 'Credit/Debit Card' | 'Online Payment' | 'Digital Wallet';

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Packed'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export type PaymentStatus = 'Unpaid' | 'Paid' | 'Refunded';

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  billingAddress: Address;
  shippingAddress: Address;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  shippingFee: number;
  tax: number;
  grandTotal: number;
  couponCode?: string;
  placedAt: string;
  estimatedDelivery: string;
}
