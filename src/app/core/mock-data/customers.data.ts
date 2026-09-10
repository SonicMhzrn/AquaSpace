import { Customer } from '../models';

/**
 * Mock authentication is intentionally simple (plaintext-equivalent hash
 * placeholder) since this is a frontend-only demo. Replace with real
 * hashing and a server-side AuthService when the .NET API is introduced.
 */
export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'cust-admin', firstName: 'Ava', lastName: 'Sterling', email: 'admin@aquashop.com',
    phone: '+1 555-010-1000', passwordHash: 'Admin@123', role: 'admin',
    avatar: 'https://i.pravatar.cc/150?img=47',
    addresses: [{ fullName: 'Ava Sterling', phone: '+1 555-010-1000', addressLine: '100 Harbor View Way', city: 'Seattle', state: 'WA', country: 'USA', postalCode: '98101' }],
    status: 'Active', registeredAt: '2025-01-10',
  },
  {
    id: 'cust-demo', firstName: 'Jordan', lastName: 'Pike', email: 'jordan@example.com',
    phone: '+1 555-010-2000', passwordHash: 'Demo@123', role: 'customer',
    avatar: 'https://i.pravatar.cc/150?img=12',
    addresses: [{ fullName: 'Jordan Pike', phone: '+1 555-010-2000', addressLine: '482 Tidewater Ave', city: 'Portland', state: 'OR', country: 'USA', postalCode: '97201' }],
    status: 'Active', registeredAt: '2025-06-22',
  },
  {
    id: 'cust-2', firstName: 'Alicia', lastName: 'Ruiz', email: 'alicia.ruiz@example.com',
    phone: '+1 555-010-2100', passwordHash: 'Password1', role: 'customer',
    addresses: [{ fullName: 'Alicia Ruiz', phone: '+1 555-010-2100', addressLine: '19 Coral Lane', city: 'Austin', state: 'TX', country: 'USA', postalCode: '73301' }],
    status: 'Active', registeredAt: '2025-08-14',
  },
  {
    id: 'cust-3', firstName: 'Devon', lastName: 'Marsh', email: 'devon.marsh@example.com',
    phone: '+1 555-010-2200', passwordHash: 'Password1', role: 'customer',
    addresses: [{ fullName: 'Devon Marsh', phone: '+1 555-010-2200', addressLine: '77 Reef Street', city: 'Miami', state: 'FL', country: 'USA', postalCode: '33101' }],
    status: 'Active', registeredAt: '2025-09-30',
  },
  {
    id: 'cust-4', firstName: 'Morgan', lastName: 'Lee', email: 'morgan.lee@example.com',
    phone: '+1 555-010-2300', passwordHash: 'Password1', role: 'customer',
    addresses: [{ fullName: 'Morgan Lee', phone: '+1 555-010-2300', addressLine: '5 Kelp Court', city: 'San Diego', state: 'CA', country: 'USA', postalCode: '92101' }],
    status: 'Inactive', registeredAt: '2025-04-02',
  },
];
