import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient();

export const ADMIN_API_BASE_URL = 'https://staging-ecom-admin-qge2.encr.app';

export type AdminRole = 'admin' | 'customer';

export type AdminDashboardOverview = {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  conversionRate: number;
  revenueTrend: number;
};

export type AdminSalesPoint = {
  label: string;
  value: number;
};

export type AdminProduct = {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  stock: number;
  sizes: string[];
  colors: string[];
  image: string;
  featured?: boolean;
};

export type AdminOrderStatus = 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';

export type AdminOrder = {
  id: string;
  orderNumber?: number;
  customerName: string;
  customerEmail?: string;
  total: number;
  status: AdminOrderStatus;
  createdAt: string;
  items: Array<{ name: string; quantity: number; price: number }>;
};

export type AdminCustomer = {
  id: string;
  name: string;
  email: string;
  totalSpent: number;
  orders: number;
  joinedAt?: string;
  status?: 'active' | 'inactive';
};

export type AdminCategory = {
  id: string;
  name: string;
  type: 'category' | 'brand';
  count?: number;
};

export type AdminReview = {
  id: string;
  productName: string;
  customerName: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'flagged';
};

function unwrapApiResponse<T>(payload: any): T {
  if (payload == null) return payload as T;
  if (Array.isArray(payload)) return payload as T;
  if (payload.data !== undefined) return payload.data as T;
  if (payload.items !== undefined) return payload.items as T;
  if (payload.result !== undefined) return payload.result as T;
  return payload as T;
}

const ORDER_STATUS_FROM_API: Record<string, AdminOrderStatus> = {
  pending: 'Pending',
  processing: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Cancelled',
};

function normalizeOrder(order: AdminOrder): AdminOrder {
  const normalizedStatus = ORDER_STATUS_FROM_API[String(order.status).toLowerCase()];
  return normalizedStatus ? { ...order, status: normalizedStatus } : order;
}

const ORDER_STATUS_TO_API: Record<AdminOrderStatus, string> = {
  Pending: 'pending',
  Confirmed: 'processing',
  Shipped: 'shipped',
  Delivered: 'delivered',
  Cancelled: 'cancelled',
};

async function request<T>(endpoint: string, token?: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${ADMIN_API_BASE_URL}${endpoint}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });

  const text = await response.text();
  let payload: any = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    const message = payload?.message || payload?.error || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return unwrapApiResponse<T>(payload);
}

export const adminApi = {
  getDashboardOverview: (token: string) => request<AdminDashboardOverview>('/admin/dashboard/overview', token),
  getSales: (token: string, period: 'daily' | 'weekly' | 'monthly' = 'daily') => request<AdminSalesPoint[]>(`/admin/dashboard/sales?period=${period}`, token),
  getTopProducts: (token: string) => request<Array<{ name: string; sales: number; revenue: number }>>('/admin/dashboard/top-products', token),
  getTopCustomers: (token: string) => request<AdminCustomer[]>('/admin/dashboard/top-customers', token),
  getRecentOrders: async (token: string) => (await request<AdminOrder[]>('/admin/dashboard/recent-orders', token)).map(normalizeOrder),
  getTraffic: (token: string) => request<Array<{ label: string; value: number }>>('/admin/dashboard/traffic', token),
  getFunnel: (token: string) => request<Array<{ stage: string; value: number }>>('/admin/analytics/funnel', token),
  getProducts: (token: string) => request<AdminProduct[]>('/admin/products', token),
  getOrderById: async (token: string, orderId: string) => normalizeOrder(await request<AdminOrder>(`/admin/orders/${orderId}`, token)),
  getOrders: async (token: string) => (await request<AdminOrder[]>('/admin/orders', token)).map(normalizeOrder),
  getCustomers: (token: string) => request<AdminCustomer[]>('/admin/customers', token),
  getCategories: async (token: string) => {
    const [categories, brands] = await Promise.all([
      request<Array<Omit<AdminCategory, 'type' | 'id'> & { id: string | number }>>('/admin/products/categories', token),
      request<Array<Omit<AdminCategory, 'type' | 'id'> & { id: string | number }>>('/admin/products/brands', token),
    ]);
    return [
      ...categories.map((category) => ({ ...category, id: String(category.id), type: 'category' as const })),
      ...brands.map((brand) => ({ ...brand, id: String(brand.id), type: 'brand' as const })),
    ];
  },
  getReviews: (token: string) => request<AdminReview[]>('/admin/reviews', token),
  updateOrderStatus: async (token: string, orderId: string, status: AdminOrderStatus) => normalizeOrder(await request<AdminOrder>(`/admin/orders/${orderId}/status`, token, {
    method: 'PUT',
    body: JSON.stringify({ status: ORDER_STATUS_TO_API[status] }),
  })),
  updateReviewStatus: (token: string, reviewId: string, status: 'approved' | 'flagged') => request<AdminReview>(`/admin/reviews/${reviewId}/status`, token, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
};
