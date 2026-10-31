
import { OrderStatus, Order, Branch, Stat, Customer, BranchConcept } from './types';

export interface ConceptDefinition {
  id: BranchConcept;
  name: string;
  description: string;
  badgeClass: string;
  softBgClass: string;
}

export const CONCEPTS: ConceptDefinition[] = [
  {
    id: 'fried',
    name: 'سوخاری کاسه',
    description: 'شعب سوخاری با تم مشکی و زرد',
    badgeClass: 'bg-black text-yellow-300',
    softBgClass: 'bg-yellow-50 text-slate-800'
  },
  {
    id: 'burger',
    name: 'مکیان برگر',
    description: 'برگر و فست‌فود با تم قرمز و زرد',
    badgeClass: 'bg-red-600 text-yellow-200',
    softBgClass: 'bg-red-50 text-red-700'
  },
  {
    id: 'ash',
    name: 'آش و حلیم',
    description: 'محصولات سنتی با تم قهوه‌ای تیره',
    badgeClass: 'bg-amber-900 text-amber-100',
    softBgClass: 'bg-amber-50 text-amber-800'
  },
  {
    id: 'cafe',
    name: 'کافه‌رستوران',
    description: 'کافه‌رستوران مدرن مجموعه (در حال راه‌اندازی)',
    badgeClass: 'bg-indigo-700 text-indigo-100',
    softBgClass: 'bg-indigo-50 text-indigo-700'
  }
];

export const BRANCHES_DATA: Branch[] = [
  { id: '1', name: 'سوخاری آمل', isOpen: true, activeCouriers: 5, city: 'آمل', dailyRevenue: 12500000, concept: 'fried' },
  { id: '2', name: 'سوخاری بابل (شریعتی)', isOpen: true, activeCouriers: 8, city: 'بابل', dailyRevenue: 18900000, concept: 'fried' },
  { id: '3', name: 'سوخاری بابلسر (الکینی)', isOpen: false, activeCouriers: 0, city: 'بابلسر', dailyRevenue: 0, concept: 'fried', isMoving: true },
  { id: '4', name: 'سوخاری طالقانی بابلسر', isOpen: true, activeCouriers: 4, city: 'بابلسر', dailyRevenue: 9800000, concept: 'fried' },
  { id: '5', name: 'مکیان برگر آمل', isOpen: true, activeCouriers: 6, city: 'آمل', dailyRevenue: 15700000, concept: 'burger' },
  { id: '6', name: 'آش و حلیم بابلسر', isOpen: true, activeCouriers: 2, city: 'بابلسر', dailyRevenue: 4300000, concept: 'ash' },
  { id: '7', name: 'کافه‌رستوران کاسه', isOpen: false, activeCouriers: 0, city: 'آمل', dailyRevenue: 0, concept: 'cafe' },
];

export const RECENT_ORDERS: Order[] = [
  {
    id: '#1024',
    customerName: 'علی رضایی',
    branch: 'سوخاری بابل (شریعتی)',
    totalPrice: 450000,
    status: OrderStatus.DELIVERED,
    date: '۱۴:۳۰',
    items: ['بال سوخاری اسپایسی', 'سیب‌زمینی ویژه'],
    concept: 'fried',
    paymentStatus: 'paid',
  },
  {
    id: '#1025',
    customerName: 'مریم حسینی',
    branch: 'سوخاری آمل',
    totalPrice: 890000,
    status: OrderStatus.SHIPPED,
    date: '۱۴:۴۵',
    items: ['باکت خانوادگی سوخاری', 'نوشابه خانواده'],
    concept: 'fried',
    paymentStatus: 'paid',
  },
  {
    id: '#1026',
    customerName: 'رضا مرادی',
    branch: 'مکیان برگر آمل',
    totalPrice: 320000,
    status: OrderStatus.COOKING,
    date: '۱۵:۰۰',
    items: ['مکیان برگر دوبل', 'سیب‌زمینی مخصوص'],
    concept: 'burger',
    paymentStatus: 'pending',
  },
  {
    id: '#1027',
    customerName: 'سارا امینی',
    branch: 'آش و حلیم بابلسر',
    totalPrice: 1200000,
    status: OrderStatus.COOKING,
    date: '۱۵:۰۵',
    items: ['آش رشته مخصوص', 'حلیم گندم'],
    concept: 'ash',
    paymentStatus: 'paid',
  },
  {
    id: '#1028',
    customerName: 'حسین جعفری',
    branch: 'سوخاری طالقانی بابلسر',
    totalPrice: 670000,
    status: OrderStatus.DELIVERED,
    date: '۱۵:۲۰',
    items: ['فیله سوخاری', 'سالاد کلم'],
    concept: 'fried',
    paymentStatus: 'paid',
  },
  {
    id: '#1029',
    customerName: 'زهرا سلطانی',
    branch: 'کافه‌رستوران کاسه',
    totalPrice: 150000,
    status: OrderStatus.CANCELLED,
    date: '۱۵:۳۰',
    items: ['لاته کاراملی'],
    concept: 'cafe',
    paymentStatus: 'failed',
  },
];

export const STATS: Stat[] = [
  { label: 'فروش کل امروز', value: '۵۵,۷۰۰,۰۰۰ تومان', change: '+۱۲٪', isPositive: true, icon: 'fa-shopping-basket', color: 'orange' },
  { label: 'سفارشات در جریان', value: '۴۸', change: '+۵', isPositive: true, icon: 'fa-utensils', color: 'blue' },
  { label: 'مشتریان جدید', value: '۱۲۴', change: '+۱۸٪', isPositive: true, icon: 'fa-users', color: 'green' },
  { label: 'نرخ رضایت', value: '۹۴٪', change: '-۲٪', isPositive: false, icon: 'fa-smile', color: 'purple' },
];

export const SALES_CHART_DATA = [
  { name: 'شنبه', sales: 4000 },
  { name: 'یکشنبه', sales: 3000 },
  { name: 'دوشنبه', sales: 2000 },
  { name: 'سه‌شنبه', sales: 2780 },
  { name: 'چهارشنبه', sales: 1890 },
  { name: 'پنجشنبه', sales: 4390 },
  { name: 'جمعه', sales: 5490 },
];

export const CUSTOMERS_DATA: Customer[] = [
  {
    id: '1',
    name: 'علیرضا تهرانی',
    phone: '۰۹۱۲۳۴۵۶۷۸۹',
    totalOrders: 42,
    totalSpend: 8400000,
    lastOrder: '۱۴۰۳/۰۲/۱۵',
    avatar: 'https://i.pravatar.cc/150?u=1',
    loyaltyLevel: 'طلایی',
    preferredBranch: 'سوخاری بابل (شریعتی)',
    preferredConcept: 'fried',
  },
  {
    id: '2',
    name: 'مهسا علیزاده',
    phone: '۰۹۱۱۱۱۱۱۱۱۱',
    totalOrders: 28,
    totalSpend: 5600000,
    lastOrder: '۱۴۰۳/۰۲/۲۰',
    avatar: 'https://i.pravatar.cc/150?u=2',
    loyaltyLevel: 'نقره‌ای',
    preferredBranch: 'آش و حلیم بابلسر',
    preferredConcept: 'ash',
  },
  {
    id: '3',
    name: 'کامران نجفی',
    phone: '۰۹۳۳۳۳۳۳۳۳۳',
    totalOrders: 15,
    totalSpend: 3100000,
    lastOrder: '۱۴۰۳/۰۲/۲۱',
    avatar: 'https://i.pravatar.cc/150?u=3',
    loyaltyLevel: 'برنزی',
    preferredBranch: 'مکیان برگر آمل',
    preferredConcept: 'burger',
  },
  {
    id: '4',
    name: 'نیلوفر باقری',
    phone: '۰۹۸۸۸۸۸۸۸۸۸',
    totalOrders: 35,
    totalSpend: 7200000,
    lastOrder: '۱۴۰۳/۰۲/۱۸',
    avatar: 'https://i.pravatar.cc/150?u=4',
    loyaltyLevel: 'طلایی',
    preferredBranch: 'کافه‌رستوران کاسه',
    preferredConcept: 'cafe',
  },
];

export const BRANCH_SHARE_DATA = [
  { name: 'ساری', value: 45 },
  { name: 'بابل', value: 30 },
  { name: 'آمل', value: 20 },
  { name: 'بابلسر', value: 5 },
];

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  body: string;
  date: string;
  image: string;
  tags: string[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    slug: 'best-fried-chicken-north',
    title: 'بهترین سوخاری شمال در کاسه',
    subtitle: 'چرا سوخاری کاسه طرفداران زیادی دارد؟',
    excerpt: 'در این مطلب با ترکیب مخفی و روش پخت سوخاری کاسه آشنا می‌شوید.',
    body: 'سوخاری کاسه با ترکیب مخفی ادویه‌ها و آرد مخصوص، ترد و خوشمزه است. ما در شعب آمل، بابل و بابلسر این طعم را برای شما آماده می‌کنیم.',
    date: '۱۴۰۳/۰۲/۱۵',
    image: 'https://images.unsplash.com/photo-1567620832903-1fcb336dc75f?w=800',
    tags: ['سوخاری', 'کاسه', 'شمال'],
  },
  {
    id: '2',
    slug: 'ash-haleem-babol',
    title: 'آش و حلیم بابلسر؛ طعم اصیل شمال',
    subtitle: 'محصولات سنتی آش و حلیم در بابلسر',
    excerpt: 'آش رشته و حلیم گندم با دستور اصیل شمالی.',
    body: 'در شعبه آش و حلیم بابلسر، هر روز آش رشته و حلیم گندم با مواد تازه و دستور اصیل شمالی سرو می‌شود.',
    date: '۱۴۰۳/۰۲/۱۰',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800',
    tags: ['آش', 'حلیم', 'بابلسر'],
  },
  {
    id: '3',
    slug: 'mekiyan-burger-amol',
    title: 'مکیان برگر آمل؛ برگر با طعم شمال',
    subtitle: 'برگر و فست‌فود با کیفیت در آمل',
    excerpt: 'برگرهای مکیان با گوشت تازه و نان مخصوص.',
    body: 'مکیان برگر در آمل با گوشت تازه، نان مخصوص و سس‌های خانگی، تجربه‌ای متفاوت از فست‌فود را ارائه می‌دهد.',
    date: '۱۴۰۳/۰۲/۰۵',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
    tags: ['برگر', 'مکیان', 'آمل'],
  },
];
