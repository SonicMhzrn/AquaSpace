import { Address } from './order.model';

export type AccountRole = 'customer' | 'admin';

export type AccountStatus = 'Active' | 'Inactive';

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: AccountRole;
  avatar?: string;
  addresses: Address[];
  status: AccountStatus;
  registeredAt: string;
}

export interface AuthSession {
  customerId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: AccountRole;
  avatar?: string;
}
