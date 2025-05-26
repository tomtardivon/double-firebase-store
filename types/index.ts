export interface SmarTeenUser {
  uid: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
    phone?: string;
    address?: Address;
  };
  children: Array<{
    id: string;
    firstName: string;
    birthDate: Date;
    hasSmartteen: boolean;
  }>;
  orders: {
    totalOrders: number;
    activeSubscriptions: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface SmarTeenOrder {
  id: string;
  orderNumber: string; // SMT-YYYYMMDD-XXX
  userId: string;
  
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'activated';
  
  product: {
    name: 'SmarTeen Phone';
    devicePrice: 289;
    subscriptionPrice: 9.99;
  };
  
  child: {
    firstName: string;
    age: number;
    protectionLevel: 'strict' | 'moderate';
  };
  
  shipping: {
    address: Address;
    trackingNumber?: string;
    estimatedDelivery?: Date;
  };
  
  stripe: {
    checkoutSessionId: string;
    subscriptionId?: string;
  };
  
  timeline: {
    ordered: Date;
    shipped?: Date;
    delivered?: Date;
    subscriptionActivated?: Date;
  };
}

export interface SmarTeenSubscription {
  id: string;
  userId: string;
  orderId: string;
  
  stripeSubscriptionId: string;
  status: 'pending' | 'active' | 'cancelled';
  
  activation: {
    method: 'delivery_webhook' | 'manual' | 'auto_timeout';
    actualDate?: Date;
  };
  
  billing: {
    amount: 9.99;
    nextBilling?: Date;
  };
}

export interface CartItem {
  id: string;
  productName: string;
  price: number;
  childConfig: {
    firstName: string;
    birthDate: Date;
    protectionLevel: 'strict' | 'moderate';
  };
}