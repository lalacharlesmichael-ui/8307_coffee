export type NavigationTab = 
  | 'pos'
  | 'orders'
  | 'products'
  | 'inventory'
  | 'expenses'
  | 'reports'
  | 'customers'
  | 'settings';

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  display_order: number;
}

export interface ProductVariant {
  id: string;
  product_id?: string;
  name: string; // Small, Medium, Large
  price_adjustment: number;
  is_default?: boolean;
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
  category: 'Milk' | 'Syrup' | 'Shot' | 'Topping' | 'General' | 'Flavors' | 'Chicken Flavor' | 'Coffee Extra' | 'Sides' | 'Sauce' | (string & {});
  is_available: boolean;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  description: string;
  base_price: number;
  image_url?: string;
  emoji_icon?: string;
  is_available: boolean;
  is_archived?: boolean;
  is_promo?: boolean;
  variants?: ProductVariant[];
}

export interface CartItemCustomization {
  variant?: ProductVariant; // Size
  sugar_level?: string; // '0%' | '25%' | '50%' | '75%' | '100%'
  ice_level?: string; // 'No Ice' | 'Less Ice' | 'Regular Ice' | 'Extra Ice'
  milk_option?: string; // 'Whole Milk' | 'Oat Milk' | 'Almond Milk' | 'Soy Milk' | 'Skim Milk'
  espresso_shots?: number; // 0, 1, 2
  selected_add_ons?: AddOn[];
  special_instructions?: string;
}

export interface CartItem {
  cart_item_id: string;
  product: Product;
  customization: CartItemCustomization;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export type OrderType = 'dine_in' | 'takeout';

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled' | 'refunded';

export interface OrderItem {
  id: string;
  order_id?: string;
  product_id: string;
  product_name: string;
  variant_name?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  customizations: CartItemCustomization;
}

export interface Order {
  id: string;
  order_number: string;
  order_type: OrderType;
  customer_id?: string;
  customer_name?: string;
  table_number?: string;
  status: OrderStatus;
  subtotal: number;
  discount_amount: number;
  discount_type?: string;
  tax_amount: number;
  service_charge: number;
  total_amount: number;
  special_notes?: string;
  held_at?: string;
  created_at: string;
  completed_at?: string;
  items: OrderItem[];
  payment?: Payment;
  refund_reason?: string;
}

export type PaymentMethod = 'cash' | 'gcash' | 'card' | 'ewallet';

export interface Payment {
  id: string;
  order_id: string;
  payment_method: PaymentMethod;
  amount_paid: number;
  change_given: number;
  reference_number?: string;
  status: 'completed' | 'refunded';
  created_at: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Ingredients' | 'Packaging' | 'Dairy' | 'Coffee Beans' | 'Syrups' | 'Supplies' | 'Tea & Flavors' | 'Toppings' | 'Poultry' | 'Frozen Snacks' | 'Seasoning' | (string & {});
  unit: 'g' | 'ml' | 'pcs' | 'kg' | 'packs' | 'shots';
  current_stock: number;
  min_stock_alert: number;
  cost_per_unit: number;
  supplier_name?: string;
  updated_at?: string;
}

export interface ProductIngredient {
  id: string;
  product_id: string;
  inventory_item_id: string;
  quantity_required: number;
}

export interface InventoryMovement {
  id: string;
  inventory_item_id: string;
  inventory_item_name?: string;
  movement_type: 'sale_deduction' | 'stock_in' | 'waste' | 'expired' | 'adjustment';
  quantity_changed: number;
  previous_stock: number;
  new_stock: number;
  reason?: string;
  recorded_by: string;
  created_at: string;
}

export interface Expense {
  id: string;
  category: 'Rent' | 'Utilities' | 'Supplies' | 'Salaries' | 'Maintenance' | 'Marketing' | 'Misc';
  title: string;
  amount: number;
  expense_date: string;
  notes?: string;
  created_at: string;
}

export interface Discount {
  id: string;
  code?: string;
  name: string;
  discount_type: 'percentage' | 'fixed' | 'senior_pwd';
  value: number;
  is_active: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  loyalty_points: number;
  total_spent: number;
  total_orders: number;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  performed_by: string;
  created_at: string;
}

export interface ShopSettings {
  shop_name: string;
  tagline: string;
  logo_url: string;
  address: string;
  phone: string;
  email: string;
  tax_rate: number; // e.g. 12 for 12%
  service_charge_rate: number; // e.g. 5 for 5%
  gcash_number: string;
  maya_number: string;
  receipt_header: string;
  receipt_footer: string;
  auto_lock_minutes: number;
}
