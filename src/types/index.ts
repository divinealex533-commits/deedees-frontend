export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  categoryId: string;
  inStock: boolean;
  stockCount?: number;
  description?: string;
  createdAt: string;
  isDigital?: boolean;
  fileUrl?: string;
  accessLink?: string;
  quantity?: number;

  // Tonyix integration
  tonyixProductId?: number | null;
  tonyixOrderId?: string | null;
  assignedCredentials?: Array<{
    productName?: string | null;
    details?: string | null;
    url?: string | null;
  }>;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  imageUrl?: string;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  totalAmount: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  paymentMethod: 'instant' | 'manual';
  paymentProof?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  notes?: string;
}

export interface PaymentDetails {
  instant: {
    pocketApp: {
      number: string;
      name: string;
    };
    opay: {
      number: string;
      name: string;
    };
  };
  manual: {
    firstBank: {
      number: string;
      name: string;
    };
  };
}

export interface SupportContact {
  whatsapp: string[];
  phone: string[];
}
