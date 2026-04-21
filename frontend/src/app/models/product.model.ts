// ── Product (aligned with backend Product domain entity) ──
export type ProductCategory =
  | 'instrumental'
  | 'materiales'
  | 'equipos'
  | 'consumibles'
  | 'proteccion'
  | 'otros';

export interface Product {
  id: string;            // backend domain entity uses 'id' (mapped from MongoDB _id)
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: ProductCategory | string;
  stock: number;
  active: boolean;
  sku: string;
  brand: string;
  invima: string;
  materials: string;
  dimensions: string;
  isFavorite?: boolean;  // frontend-only
}

export function getProductImages(product: Product): string[] {
  if (!product.imageUrl) return ['assets/placeholder.svg'];
  return [product.imageUrl];
}

// ── Cart (aligned with backend Cart domain entity) ────────
export interface CartItemBackend {
  id: string;
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface CartBackend {
  id: string;
  userId: string;
  items: CartItemBackend[];
  total: number;
}

// ── Orders (aligned with backend Order domain entity) ─────
export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
export type CustomerDocumentType = 'cc' | 'ce' | 'nit' | 'passport';
export type PaymentMethod = 'pse' | 'card';
export type CardBrand = 'visa' | 'mastercard' | 'amex';

export interface OrderItem {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface OrderStatusChange {
  from: OrderStatus | null;
  to: OrderStatus;
  changedAt: Date;
  changedBy: string;
}

export interface OrderCustomer {
  fullName: string;
  email: string;
  phone: string;
  documentType: CustomerDocumentType;
  documentNumber: string;
}

export interface OrderShipping {
  department: string;
  city: string;
  addressLine1: string;
  addressLine2?: string;
  reference?: string;
}

export interface OrderPayment {
  method: PaymentMethod;
  cardBrand?: CardBrand;
}

export interface CheckoutPayload {
  customer: OrderCustomer;
  shipping: OrderShipping;
  payment: OrderPayment;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  checkoutDetails?: CheckoutPayload;
  status: OrderStatus;
  statusHistory: OrderStatusChange[];
  orderNumber?: number;
  createdAt?: string | Date;
}

// ── Auth ──────────────────────────────────────────────────
export interface AuthResponse {
  token: string;
}

export interface UserPayload {
  sub: string;
  email: string;
  role: 'customer' | 'admin';
  provider: 'local' | 'google';
  iat?: number;
  exp?: number;
}

// ── Categories (aligned with backend CategoryWithCount) ──
export interface CategoryWithCount {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  productCount: number;
}

// ── Filter State (frontend only) ─────────────────────────
export interface FilterState {
  category: string | null;
  brand: string | null;
  materials: string[];
  priceMin: number;
  priceMax: number;
  sortBy: 'newest' | 'price_asc' | 'price_desc' | 'popular';
}
