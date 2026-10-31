
export enum OrderStatus {
  COOKING = 'در حال پخت',
  SHIPPED = 'ارسال شده',
  DELIVERED = 'تحویل شد',
  CANCELLED = 'لغو شده'
}

// نوع کانسپت هر مجموعه غذایی
export type BranchConcept = 'fried' | 'burger' | 'ash' | 'cafe';

// وضعیت پرداخت برای سفارش‌ها (برای UI درگاه پرداخت)
export type PaymentStatus = 'paid' | 'pending' | 'failed';

export interface Order {
  id: string;
  customerName: string;
  branch: string;
  totalPrice: number;
  status: OrderStatus;
  date: string;
  items: string[];
  concept: BranchConcept;
  paymentStatus?: PaymentStatus;
}

export interface Branch {
  id: string;
  name: string;
  isOpen: boolean;
  activeCouriers: number;
  city: string;
  dailyRevenue: number;
  concept: BranchConcept;
  // برای نشان دادن این‌که شعبه در حال جابه‌جایی است
  isMoving?: boolean;
}

export interface Stat {
  label: string;
  value: string | number;
  change: string;
  isPositive: boolean;
  icon: string;
  color: string;
}

// نقش‌های کلی سیستم (فقط برای UI و سطح دسترسی فرانت)
export type UserRole = 'owner' | 'branchManager' | 'cashier' | 'chef';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  totalOrders: number;
  totalSpend: number;
  lastOrder: string;
  avatar: string;
  loyaltyLevel: 'طلایی' | 'نقره‌ای' | 'برنزی';
  // برای فیلتر در UI مشتریان
  preferredBranch?: string;
  preferredConcept?: BranchConcept;
}
