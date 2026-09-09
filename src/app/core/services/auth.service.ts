import { Injectable, computed, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AuthSession, Customer } from '../models';
import { MOCK_CUSTOMERS } from '../mock-data';
import { STORAGE_KEYS, StorageService } from './storage.service';

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  addressLine?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

/**
 * Mock, frontend-only authentication. Passwords are stored as plain text
 * in localStorage for demo purposes only — this entire service is
 * designed to be swapped for calls to POST /api/auth/login and
 * /api/auth/register without touching consuming components, which only
 * read `session()` and call login/register/logout.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _customers = signal<Customer[]>([]);
  private readonly _session = signal<AuthSession | null>(null);

  readonly session = this._session.asReadonly();
  readonly isAuthenticated = computed(() => this._session() !== null);
  readonly isAdmin = computed(() => this._session()?.role === 'admin');

  constructor(private storage: StorageService) {
    this.storage.seed(STORAGE_KEYS.customers, MOCK_CUSTOMERS);
    this._customers.set(this.storage.get<Customer[]>(STORAGE_KEYS.customers, MOCK_CUSTOMERS));
    this._session.set(this.storage.get<AuthSession | null>(STORAGE_KEYS.session, null));
  }

  private persistCustomers(): void {
    this.storage.set(STORAGE_KEYS.customers, this._customers());
  }

  login(email: string, password: string, rememberMe = true): Observable<AuthSession> {
    const customer = this._customers().find((c) => c.email.toLowerCase() === email.toLowerCase());
    if (!customer || customer.passwordHash !== password) {
      return throwError(() => new Error('Invalid email or password.')).pipe(delay(300));
    }
    if (customer.status === 'Inactive') {
      return throwError(() => new Error('This account has been deactivated.')).pipe(delay(300));
    }
    const session: AuthSession = {
      customerId: customer.id,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      role: customer.role,
      avatar: customer.avatar,
    };
    this._session.set(session);
    if (rememberMe) {
      this.storage.set(STORAGE_KEYS.session, session);
    }
    return of(session).pipe(delay(300));
  }

  register(payload: RegisterPayload): Observable<AuthSession> {
    const exists = this._customers().some((c) => c.email.toLowerCase() === payload.email.toLowerCase());
    if (exists) {
      return throwError(() => new Error('An account with this email already exists.')).pipe(delay(300));
    }
    const customer: Customer = {
      id: `cust-${Date.now()}`,
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      phone: payload.phone,
      passwordHash: payload.password,
      role: 'customer',
      addresses: payload.addressLine
        ? [{
            fullName: `${payload.firstName} ${payload.lastName}`,
            phone: payload.phone,
            addressLine: payload.addressLine,
            city: payload.city ?? '',
            state: payload.state ?? '',
            country: payload.country ?? '',
            postalCode: payload.postalCode ?? '',
          }]
        : [],
      status: 'Active',
      registeredAt: new Date().toISOString().slice(0, 10),
    };
    this._customers.update((list) => [...list, customer]);
    this.persistCustomers();

    const session: AuthSession = {
      customerId: customer.id,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      role: customer.role,
    };
    this._session.set(session);
    this.storage.set(STORAGE_KEYS.session, session);
    return of(session).pipe(delay(300));
  }

  logout(): void {
    this._session.set(null);
    this.storage.remove(STORAGE_KEYS.session);
  }

  getCurrentCustomer(): Customer | undefined {
    const session = this._session();
    if (!session) return undefined;
    return this._customers().find((c) => c.id === session.customerId);
  }

  updateCurrentCustomer(changes: Partial<Customer>): void {
    const session = this._session();
    if (!session) return;
    this._customers.update((list) => list.map((c) => (c.id === session.customerId ? { ...c, ...changes } : c)));
    this.persistCustomers();
    if (changes.firstName || changes.lastName || changes.avatar) {
      this._session.update((s) => (s ? { ...s, firstName: changes.firstName ?? s.firstName, lastName: changes.lastName ?? s.lastName, avatar: changes.avatar ?? s.avatar } : s));
      this.storage.set(STORAGE_KEYS.session, this._session());
    }
  }

  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    const customer = this.getCurrentCustomer();
    if (!customer || customer.passwordHash !== currentPassword) {
      return throwError(() => new Error('Current password is incorrect.')).pipe(delay(200));
    }
    this._customers.update((list) => list.map((c) => (c.id === customer.id ? { ...c, passwordHash: newPassword } : c)));
    this.persistCustomers();
    return of(void 0).pipe(delay(200));
  }
}
