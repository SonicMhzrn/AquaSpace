import { Order } from '../models';

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ord-1', orderNumber: 'AQ-100234', customerId: 'cust-demo', customerName: 'Jordan Pike', customerEmail: 'jordan@example.com',
    items: [
      { productId: 'p-neon-tetra', name: 'Neon Tetra', image: 'https://images.unsplash.com/photo-1520302519104-c452c2eddb56?w=400&q=80', unitPrice: 4.49, quantity: 6, lineTotal: 26.94 },
      { productId: 'p-java-fern', name: 'Java Fern', image: 'https://images.unsplash.com/photo-1524683079666-091ec38e2c78?w=400&q=80', unitPrice: 6.99, quantity: 2, lineTotal: 13.98 },
    ],
    billingAddress: { fullName: 'Jordan Pike', phone: '+1 555-010-2000', addressLine: '482 Tidewater Ave', city: 'Portland', state: 'OR', country: 'USA', postalCode: '97201' },
    shippingAddress: { fullName: 'Jordan Pike', phone: '+1 555-010-2000', addressLine: '482 Tidewater Ave', city: 'Portland', state: 'OR', country: 'USA', postalCode: '97201' },
    deliveryMethod: 'Standard Delivery', paymentMethod: 'Credit/Debit Card', paymentStatus: 'Paid', status: 'Delivered',
    subtotal: 40.92, discount: 0, shippingFee: 5.99, tax: 2.87, grandTotal: 49.78,
    placedAt: '2026-01-10', estimatedDelivery: '2026-01-16',
  },
  {
    id: 'ord-2', orderNumber: 'AQ-100301', customerId: 'cust-demo', customerName: 'Jordan Pike', customerEmail: 'jordan@example.com',
    items: [
      { productId: 'p-starter-kit-20', name: 'Aquarium Starter Kit (20 Gal)', image: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=400&q=80', unitPrice: 104.99, quantity: 1, lineTotal: 104.99 },
    ],
    billingAddress: { fullName: 'Jordan Pike', phone: '+1 555-010-2000', addressLine: '482 Tidewater Ave', city: 'Portland', state: 'OR', country: 'USA', postalCode: '97201' },
    shippingAddress: { fullName: 'Jordan Pike', phone: '+1 555-010-2000', addressLine: '482 Tidewater Ave', city: 'Portland', state: 'OR', country: 'USA', postalCode: '97201' },
    deliveryMethod: 'Express Delivery', paymentMethod: 'Digital Wallet', paymentStatus: 'Paid', status: 'Shipped',
    subtotal: 104.99, discount: 10.50, shippingFee: 12.99, tax: 6.83, grandTotal: 114.31,
    couponCode: 'AQUA10', placedAt: '2026-02-14', estimatedDelivery: '2026-02-17',
  },
  {
    id: 'ord-3', orderNumber: 'AQ-100355', customerId: 'cust-2', customerName: 'Alicia Ruiz', customerEmail: 'alicia.ruiz@example.com',
    items: [
      { productId: 'p-betta-fish', name: 'Betta Fish', image: 'https://images.unsplash.com/photo-1524704796725-9fc3044a58b2?w=400&q=80', unitPrice: 12.99, quantity: 1, lineTotal: 12.99 },
      { productId: 'p-betta-pellets', name: 'Betta Pellets', image: 'https://images.unsplash.com/photo-1584967911318-3ce0dd6f4ca0?w=400&q=80', unitPrice: 6.49, quantity: 1, lineTotal: 6.49 },
    ],
    billingAddress: { fullName: 'Alicia Ruiz', phone: '+1 555-010-2100', addressLine: '19 Coral Lane', city: 'Austin', state: 'TX', country: 'USA', postalCode: '73301' },
    shippingAddress: { fullName: 'Alicia Ruiz', phone: '+1 555-010-2100', addressLine: '19 Coral Lane', city: 'Austin', state: 'TX', country: 'USA', postalCode: '73301' },
    deliveryMethod: 'Standard Delivery', paymentMethod: 'Cash on Delivery', paymentStatus: 'Unpaid', status: 'Processing',
    subtotal: 19.48, discount: 0, shippingFee: 5.99, tax: 1.36, grandTotal: 26.83,
    placedAt: '2026-02-20', estimatedDelivery: '2026-02-26',
  },
  {
    id: 'ord-4', orderNumber: 'AQ-100402', customerId: 'cust-3', customerName: 'Devon Marsh', customerEmail: 'devon.marsh@example.com',
    items: [
      { productId: 'p-canister-filter', name: 'External Canister Filter', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&q=80', unitPrice: 89.99, quantity: 1, lineTotal: 89.99 },
    ],
    billingAddress: { fullName: 'Devon Marsh', phone: '+1 555-010-2200', addressLine: '77 Reef Street', city: 'Miami', state: 'FL', country: 'USA', postalCode: '33101' },
    shippingAddress: { fullName: 'Devon Marsh', phone: '+1 555-010-2200', addressLine: '77 Reef Street', city: 'Miami', state: 'FL', country: 'USA', postalCode: '33101' },
    deliveryMethod: 'Store Pickup', paymentMethod: 'Credit/Debit Card', paymentStatus: 'Paid', status: 'Pending',
    subtotal: 89.99, discount: 0, shippingFee: 0, tax: 6.30, grandTotal: 96.29,
    placedAt: '2026-03-01', estimatedDelivery: '2026-03-04',
  },
];
