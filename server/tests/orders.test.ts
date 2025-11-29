import assert from 'node:assert';
import { listOrders, createOrder } from '../orders';

const before = listOrders().length;
const order = createOrder('Test User', 'test@example.com', [
  { productId: '1', name: 'iPhone 15', image: 'https://placehold.co/400x400', category: 'Electronics', price: 799, quantity: 1 },
]);

assert.ok(order.id, 'Order should have id');
assert.strictEqual(order.customerEmail, 'test@example.com');
assert.ok(order.items.length === 1);
assert.ok(listOrders().length === before + 1);

console.log('orders.test passed');

