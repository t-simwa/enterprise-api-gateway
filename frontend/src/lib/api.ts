const rawBase = import.meta.env.VITE_API_BASE_URL as string | undefined;
const BASE = rawBase?.replace(/\/$/, "") ?? "";
export const isMock = rawBase === "mock";

function token() {
  try {
    const raw = localStorage.getItem("eag.auth.v1");
    if (!raw) return null;
    return JSON.parse(raw).accessToken as string | null;
  } catch {
    return null;
  }
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? `${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

function apiPath(path: string) {
  return `/api${path}`;
}

export interface DashboardData {
  total_orders: number;
  total_revenue: number;
  avg_processing_hours: number;
  orders_by_status: Record<string, number>;
  orders_today: number;
  pending_orders_count: number;
  low_stock_count: number;
}
export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string | null;
  unit_price: number;
  reorder_point: number;
  is_active: boolean;
}
export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total_amount: number;
  items_count: number;
  created_at: string;
}
export interface OrderItem {
  product_id: string;
  product_name: string;
  sku: string;
  quantity: number;
  unit_price: number;
}
export interface OrderDetail extends Order {
  customer_email: string;
  items: OrderItem[];
  timeline: { status: string; timestamp: string }[];
}
export interface LowStockItem {
  product_id: string;
  sku: string;
  name: string;
  category: string | null;
  total_qty: number;
  reorder_point: number;
}
export interface OrderItemInput {
  product_id: string;
  quantity: number;
}
export interface OrderCreateInput {
  customer_name: string;
  customer_email?: string;
  items: OrderItemInput[];
}
export interface ProductCreateInput {
  sku: string;
  name: string;
  category?: string;
  unit_price: number;
  reorder_point?: number;
}
export interface InventoryRow {
  product_id: string;
  sku: string;
  name: string;
  warehouse: string;
  quantity: number;
  reserved: number;
  available: number;
}

const STATUSES: Order["status"][] = ["pending", "processing", "shipped", "delivered", "cancelled"];
const CUSTOMERS = [
  "Acme Inc.", "Globex", "Initech", "Umbrella Co.", "Wayne Enterprises",
  "Stark Industries", "Hooli", "Pied Piper", "Soylent", "Massive Dynamic",
];
const CATEGORIES = ["Hardware", "Apparel", "Accessories", "Components", "Tools"];
const PRODUCT_NAMES = [
  "Carbon Mesh Hoodie", "Tungsten Bolt M6", "Helix Cable USB-C", "Quartz Sensor v2",
  "Atlas Backpack 30L", "Vector Multitool", "Orbit Mouse Pad", "Photon LED Strip",
  "Nimbus Wireless Hub", "Cipher Mechanical Keyboard", "Pulse Headset Pro", "Mantis Tripod",
];

function genProducts(): Product[] {
  return PRODUCT_NAMES.map((name, i) => ({
    id: `p_${i + 1}`,
    sku: `SKU-${(1000 + i).toString()}`,
    name,
    category: CATEGORIES[i % CATEGORIES.length],
    unit_price: Math.round(2000 + Math.random() * 18000) / 100,
    reorder_point: 20 + (i % 5) * 10,
    is_active: true,
  }));
}

let PRODUCTS: Product[] = [];
function loadProducts(): Product[] {
  try {
    const raw = localStorage.getItem("eag.products");
    if (raw) return JSON.parse(raw);
  } catch { /* noop */ }
  return genProducts();
}
function persistProducts() {
  localStorage.setItem("eag.products", JSON.stringify(PRODUCTS));
}
PRODUCTS = loadProducts();

function genOrderItems(o: Order): OrderItem[] {
  const count = o.id.startsWith("o_") ? parseInt(o.id.split("_")[1], 10) % 6 + 1 : o.items_count;
  const seed = o.id.split("_").pop()?.charCodeAt(0) ?? 1;
  return Array.from({ length: count }, (_, j) => {
    const pi = (seed + j * 3) % PRODUCTS.length;
    const p = PRODUCTS[pi];
    return {
      product_id: p.id,
      product_name: p.name,
      sku: p.sku,
      quantity: 1 + (j % 4),
      unit_price: p.unit_price,
    };
  });
}

function genOrders(n = 60): Order[] {
  const now = Date.now();
  return Array.from({ length: n }, (_, i) => ({
    id: `o_${i + 1}`,
    order_number: `EAG-${(10240 + i).toString()}`,
    customer_name: CUSTOMERS[i % CUSTOMERS.length],
    status: STATUSES[i % STATUSES.length],
    total_amount: Math.round(5000 + Math.random() * 120000) / 100,
    items_count: 1 + (i % 6),
    created_at: new Date(now - i * 3600_000 * (1 + Math.random())).toISOString(),
  }));
}

let ORDERS: Order[] = [];
let ORDER_ITEMS: Record<string, OrderItem[]> = {};

function loadOrders(): Order[] {
  try {
    const raw = localStorage.getItem("eag.orders");
    if (raw) return JSON.parse(raw);
  } catch { /* noop */ }
  const orders = genOrders();
  orders.forEach((o) => { ORDER_ITEMS[o.id] = genOrderItems(o); });
  return orders;
}

function persistOrders() {
  localStorage.setItem("eag.orders", JSON.stringify(ORDERS));
}

ORDERS = loadOrders();

function genInventory(): InventoryRow[] {
  const warehouses = ["US-East", "US-West", "EU-Central", "APAC"];
  const rows: InventoryRow[] = [];
  PRODUCTS.forEach((p, i) => {
    warehouses.forEach((w, j) => {
      const qty = Math.max(0, Math.round(((i * 7 + j * 11) % 90) - (j === 0 && i % 4 === 0 ? 80 : 0)));
      rows.push({
        product_id: p.id,
        sku: p.sku,
        name: p.name,
        warehouse: w,
        quantity: qty,
        reserved: Math.min(qty, Math.round(qty * 0.15)),
        available: Math.max(0, qty - Math.round(qty * 0.15)),
      });
    });
  });
  return rows;
}
const INVENTORY = genInventory();

function mockDashboard(): DashboardData {
  const total_revenue = ORDERS.reduce((s, o) => s + o.total_amount, 0);
  const orders_by_status = STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = ORDERS.filter((o) => o.status === s).length;
    return acc;
  }, {});
  return {
    total_orders: ORDERS.length,
    total_revenue,
    avg_processing_hours: 6.4,
    orders_by_status,
    orders_today: ORDERS.filter(
      (o) => new Date(o.created_at).toDateString() === new Date().toDateString(),
    ).length,
    pending_orders_count: orders_by_status["pending"] ?? 0,
    low_stock_count: INVENTORY.filter((r) => r.quantity < 10).length,
  };
}

function mockRevenueSeries(days = 30) {
  const out: { date: string; revenue: number }[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const base = 4200 + Math.sin(i / 3) * 1100 + Math.random() * 1400;
    out.push({ date: d.toISOString().slice(0, 10), revenue: Math.round(base) });
  }
  return out;
}

function mockLowStock(): LowStockItem[] {
  return INVENTORY.filter((r) => r.quantity < 10)
    .slice(0, 8)
    .map((r) => {
      const p = PRODUCTS.find((p) => p.id === r.product_id)!;
      return {
        product_id: r.product_id,
        sku: r.sku,
        name: r.name,
        category: p.category,
        total_qty: r.quantity,
        reorder_point: p.reorder_point,
      };
    });
}

function mockCreateOrder(input: OrderCreateInput): Order {
  const num = 10300 + Math.floor(Math.random() * 300);
  const items = input.items.map((i) => {
    const p = PRODUCTS.find((x) => x.id === i.product_id)!;
    return {
      product_id: i.product_id,
      product_name: p?.name ?? "Unknown",
      sku: p?.sku ?? "",
      quantity: i.quantity,
      unit_price: p?.unit_price ?? 0,
    };
  });
  const total_amount = Math.round(items.reduce((s, i) => s + i.unit_price * i.quantity, 0) * 100) / 100;
  const order: Order = {
    id: `o_${Date.now()}`,
    order_number: `EAG-${num}`,
    customer_name: input.customer_name,
    status: "pending",
    total_amount,
    items_count: input.items.length,
    created_at: new Date().toISOString(),
  };
  ORDERS.unshift(order);
  ORDER_ITEMS[order.id] = items;
  persistOrders();
  return order;
}

function mockCreateProduct(input: ProductCreateInput): Product {
  const cat = input.category || CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
  const product: Product = {
    id: `p_${Date.now()}`,
    sku: input.sku,
    name: input.name,
    category: cat,
    unit_price: input.unit_price,
    reorder_point: input.reorder_point ?? 10,
    is_active: true,
  };
  PRODUCTS.push(product);
  persistProducts();
  return product;
}

function mockOrderDetail(orderId: string): OrderDetail | undefined {
  const o = ORDERS.find((x) => x.id === orderId);
  if (!o) return undefined;
  const items = ORDER_ITEMS[orderId];
  if (!items) {
    ORDER_ITEMS[orderId] = genOrderItems(o);
  }
  const timeline: { status: string; timestamp: string }[] = [
    { status: "created", timestamp: o.created_at },
    { status: o.status, timestamp: new Date().toISOString() },
  ];
  const customer_email = CUSTOMERS.find((c) => c === o.customer_name)
    ? `${o.customer_name.toLowerCase().replace(/[^a-z]/g, "")}@example.com`
    : "customer@example.com";
  return {
    ...o,
    customer_email,
    items: ORDER_ITEMS[orderId] ?? [],
    timeline,
  };
}

async function reqList<T>(path: string, init?: RequestInit): Promise<T[]> {
  const data = await req<{ items: T[] }>(path, init);
  return data.items;
}

export const api = {
  dashboard: async (): Promise<DashboardData> =>
    isMock ? Promise.resolve(mockDashboard()) : req(apiPath("/orders/dashboard")),
  revenueSeries: async (days = 30): Promise<{ date: string; revenue: number }[]> =>
    isMock ? Promise.resolve(mockRevenueSeries(days)) : req(apiPath(`/analytics/revenue?days=${days}`)),
  recentOrders: async (limit = 10): Promise<Order[]> =>
    isMock ? Promise.resolve(ORDERS.slice(0, limit)) : reqList<Order>(apiPath(`/orders?size=${limit}`)),
  allOrders: async (): Promise<Order[]> =>
    isMock ? Promise.resolve([...ORDERS]) : reqList<Order>(apiPath("/orders?size=100")),
  products: async (): Promise<Product[]> =>
    isMock ? Promise.resolve([...PRODUCTS]) : reqList<Product>(apiPath("/products?size=100")),
  inventory: async (): Promise<InventoryRow[]> =>
    isMock ? Promise.resolve([...INVENTORY]) : req<InventoryRow[]>(apiPath("/inventory")),
  lowStock: async (): Promise<LowStockItem[]> =>
    isMock ? Promise.resolve(mockLowStock()) : req<LowStockItem[]>(apiPath("/inventory/low-stock")),
  orderDetail: async (id: string): Promise<OrderDetail> =>
    isMock ? Promise.resolve(mockOrderDetail(id)!) : req<OrderDetail>(apiPath(`/orders/${id}`)),
  createOrder: async (input: OrderCreateInput): Promise<Order> =>
    isMock ? Promise.resolve(mockCreateOrder(input)) : req<Order>(apiPath("/orders"), { method: "POST", body: JSON.stringify(input) }),
  createProduct: async (input: ProductCreateInput): Promise<Product> =>
    isMock ? Promise.resolve(mockCreateProduct(input)) : req<Product>(apiPath("/products"), { method: "POST", body: JSON.stringify(input) }),
};

export function sparkSeries(seed: number, len = 14): number[] {
  const out: number[] = [];
  let v = 50 + (seed % 30);
  for (let i = 0; i < len; i++) {
    v += Math.sin((i + seed) / 1.7) * 6 + ((seed * 7 + i * 13) % 9) - 4;
    out.push(Math.max(10, Math.round(v)));
  }
  return out;
}

export function formatUSD(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatNum(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}
