import { StoreSettings } from '../models';

export const MOCK_SETTINGS: StoreSettings = {
  storeName: 'AquaShop',
  logo: '',
  email: 'hello@aquashop.com',
  phone: '+1 (800) 555-0142',
  address: '100 Harbor View Way, Seattle, WA 98101',
  businessHours: 'Mon–Fri 9am–6pm, Sat 10am–4pm PST',
  currency: 'INR',
  currencySymbol: 'Rs.',
  taxRatePercent: 7,
  shippingFee: 5.99,
  freeShippingThreshold: 75,
  socialLinks: {
    facebook: 'https://facebook.com/aquashop',
    instagram: 'https://instagram.com/aquashop',
    youtube: 'https://youtube.com/@aquashop',
    tiktok: 'https://tiktok.com/@aquashop',
  },
  maintenanceMode: false,
  registrationEnabled: true,
  reviewsEnabled: true,
  wishlistEnabled: true,
};
