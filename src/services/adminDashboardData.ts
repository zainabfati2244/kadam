import type {
  AdminCustomer,
  AdminDashboardOverview,
  AdminOrder,
} from './adminApi';

export function mergeRecentOrders(remoteOrders: AdminOrder[], localOrders: AdminOrder[]): AdminOrder[] {
  const ordersById = new Map<string, AdminOrder>();
  [...localOrders, ...remoteOrders].forEach((order) => ordersById.set(order.id, order));
  return [...ordersById.values()].sort(
    (first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt)
  );
}

export function addLocalOrdersToOverview(
  overview: AdminDashboardOverview | undefined,
  localOrders: AdminOrder[]
): AdminDashboardOverview {
  const customerKeys = new Set(
    localOrders.map((order) => order.customerEmail?.trim().toLowerCase() || order.customerName.trim().toLowerCase())
  );

  return {
    totalSales: (overview?.totalSales || 0) + localOrders.reduce((total, order) => total + order.total, 0),
    totalOrders: (overview?.totalOrders || 0) + localOrders.length,
    totalCustomers: (overview?.totalCustomers || 0) + customerKeys.size,
    conversionRate: overview?.conversionRate || 0,
    revenueTrend: overview?.revenueTrend || 0,
  };
}

export function mergeTopCustomers(remoteCustomers: AdminCustomer[], localOrders: AdminOrder[]): AdminCustomer[] {
  const localCustomers = new Map<string, AdminCustomer>();

  localOrders.forEach((order) => {
    const email = order.customerEmail?.trim().toLowerCase() || '';
    const key = email || order.customerName.trim().toLowerCase();
    const existing = localCustomers.get(key);
    localCustomers.set(key, {
      id: existing?.id || `local-${key}`,
      name: existing?.name || order.customerName,
      email: existing?.email || email,
      totalSpent: (existing?.totalSpent || 0) + order.total,
      orders: (existing?.orders || 0) + 1,
      joinedAt: existing?.joinedAt || order.createdAt,
      status: 'active',
    });
  });

  const mergedCustomers = new Map<string, AdminCustomer>();
  [...remoteCustomers, ...localCustomers.values()].forEach((customer) => {
    const key = customer.email.trim().toLowerCase() || customer.id;
    const existing = mergedCustomers.get(key);
    mergedCustomers.set(key, existing ? {
      ...existing,
      totalSpent: existing.totalSpent + customer.totalSpent,
      orders: existing.orders + customer.orders,
    } : customer);
  });

  return [...mergedCustomers.values()].sort((first, second) => second.totalSpent - first.totalSpent);
}