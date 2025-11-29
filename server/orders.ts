export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  category?: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

const statuses = ["Processing", "Shipped", "Delivered", "Cancelled"];

function randomFrom<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

const demoNames = ["Alice Nguyen", "Bob Tran", "Carol Pham", "David Le", "Eve Nguyen"];
const demoEmails = ["alice@example.com", "bob@example.com", "carol@example.com", "david@example.com", "eve@example.com"];
const demoProducts = [
  { id: "1", name: "iPhone 15", price: 799.0, image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&h=400&fit=crop", category: "Electronics" },
  { id: "8", name: "Vitamix E310 Blender", price: 349.99, image: "https://m.media-amazon.com/images/I/71C65ab7clL._AC_UF894,1000_QL80_.jpg", category: "Home & Kitchen" },
  { id: "57", name: "Kindle Paperwhite", price: 149.99, image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop", category: "Electronics" },
  { id: "83", name: "Cuisinart 4-Slice Toaster", price: 89.99, image: "https://placehold.co/400x400?text=toaster", category: "Home & Kitchen" },
  { id: "30", name: "TrailMaster Hiking Boots", price: 175.0, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOBIZuzBFTHFxx1EodZjzTidFocfzFJm1zYA&s", category: "Sports & Outdoors" },
  { id: "121", name: "Pro V1 Golf Balls", price: 52.0, image: "https://placehold.co/400x400?text=golf+balls", category: "Sports & Outdoors" },
  { id: "45", name: "Urban Fleece Hoodie", price: 39.99, image: "https://placehold.co/400x400?text=hoodie", category: "Clothing" },
  { id: "12", name: "Apple Watch Series 9", price: 399.99, image: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&h=400&fit=crop", category: "Accessories" },
];

function generateOrders(n: number): Order[] {
  const out: Order[] = [];
  const now = Date.now();
  for (let i = 0; i < n; i++) {
    const itemCount = 1 + Math.floor(Math.random() * 4);
    const items: OrderItem[] = [];
    for (let j = 0; j < itemCount; j++) {
      const p = randomFrom(demoProducts);
      const qty = 1 + Math.floor(Math.random() * 3);
      items.push({ productId: p.id, name: p.name, image: p.image, category: p.category, price: p.price, quantity: qty });
    }
    const total = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
    const status = randomFrom(statuses);
    const createdAt = new Date(now - Math.floor(Math.random() * 90) * 24 * 3600 * 1000 - Math.floor(Math.random() * 86400000)).toISOString();
    const who = Math.floor(Math.random() * demoNames.length);
    out.push({
      id: String(10000 + i),
      customerName: demoNames[who],
      customerEmail: demoEmails[who],
      total: Math.round(total * 100) / 100,
      status,
      createdAt,
      items,
    });
  }
  return out.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

const ordersStore: Order[] = generateOrders(120);

export function createOrder(customerName: string, customerEmail: string, items: OrderItem[], status: string = "Processing"): Order {
  const total = Math.round(items.reduce((sum, it) => sum + it.price * it.quantity, 0) * 100) / 100;
  const createdAt = new Date().toISOString();
  const id = String(10000 + ordersStore.length + 1);
  const order: Order = { id, customerName, customerEmail, total, status, createdAt, items };
  ordersStore.unshift(order);
  return order;
}

export function listOrders(): Order[] { return ordersStore; }
export function getOrder(id: string): Order | undefined { return ordersStore.find(o => o.id === id); }
