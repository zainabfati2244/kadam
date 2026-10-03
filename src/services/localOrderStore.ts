import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AdminOrder, AdminOrderStatus } from './adminApi';

const LOCAL_ORDERS_KEY = '@kadam_testing_orders';

export type LocalOrderInput = {
  id?: string;
  customerName: string;
  email: string;
  items: Array<{ id: string; name?: string; quantity: number; price?: number }>;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  stripePaymentIntentId?: string | null;
  shippingAddress: { fullName: string; phone: string; address: string; city: string };
  shippingMethod: string;
};

export async function saveLocalOrder(input: LocalOrderInput): Promise<AdminOrder> {
  const existing = await getLocalOrders();
  const order: AdminOrder = {
    id: input.id || `local-${Date.now()}`,
    orderNumber: existing.length + 1,
    customerName: input.customerName,
    customerEmail: input.email,
    total: input.total,
    status: 'Pending',
    createdAt: new Date().toISOString(),
    items: input.items.map((item) => ({
      name: item.name || item.id,
      quantity: item.quantity,
      price: item.price || 0,
    })),
  };

  await AsyncStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify([order, ...existing]));
  return order;
}

export async function getLocalOrders(): Promise<AdminOrder[]> {
  const stored = await AsyncStorage.getItem(LOCAL_ORDERS_KEY);
  if (!stored) return [];

  try {
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return (parsed as AdminOrder[]).map((order, index, orders) => ({
      ...order,
      orderNumber: orders.length - index,
    }));
  } catch {
    return [];
  }
}

export async function getLocalOrderById(orderId: string): Promise<AdminOrder | undefined> {
  const orders = await getLocalOrders();
  return orders.find((order) => order.id === orderId);
}

export async function updateLocalOrderStatus(orderId: string, status: AdminOrderStatus): Promise<AdminOrder> {
  const orders = await getLocalOrders();
  const orderIndex = orders.findIndex((order) => order.id === orderId);
  if (orderIndex < 0) throw new Error('This local order is not available on this device.');

  const updatedOrder = { ...orders[orderIndex], status };
  orders[orderIndex] = updatedOrder;
  await AsyncStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
  return updatedOrder;
}
