import type { Category, Product, AddOn, InventoryItem, ProductIngredient, Customer, Discount, Expense, ShopSettings, Order } from '../types/pos';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Coffee-Based Drinks', slug: 'coffee-based', icon: 'Coffee', display_order: 1 },
  { id: 'cat-2', name: 'Non-Coffee Drinks', slug: 'non-coffee', icon: 'CupSoda', display_order: 2 },
  { id: 'cat-3', name: 'Fruit Soda', slug: 'fruit-soda', icon: 'Sparkles', display_order: 3 },
  { id: 'cat-4', name: 'Chicken Menu', slug: 'chicken-menu', icon: 'Utensils', display_order: 4 },
  { id: 'cat-5', name: 'French Fries', slug: 'french-fries', icon: 'Cookie', display_order: 5 },
  { id: 'cat-6', name: 'Add-ons & Extras', slug: 'add-ons', icon: 'PlusCircle', display_order: 6 },
];

export const INITIAL_ADD_ONS: AddOn[] = [
  // Flavors for Chicken & Fries
  { id: 'addon-1', name: 'BBQ Flavor', price: 0, category: 'Flavors', is_available: true },
  { id: 'addon-2', name: 'Sour Cream Flavor', price: 0, category: 'Flavors', is_available: true },
  { id: 'addon-3', name: 'Cheese Flavor', price: 0, category: 'Flavors', is_available: true },
  { id: 'addon-4', name: 'Buffalo Wings Sauce', price: 0, category: 'Chicken Flavor', is_available: true },
  { id: 'addon-5', name: 'Honey Butter Sauce', price: 0, category: 'Chicken Flavor', is_available: true },
  { id: 'addon-6', name: 'Sweet Chili Sauce', price: 0, category: 'Chicken Flavor', is_available: true },
  { id: 'addon-7', name: 'Garlic Parmesan Sauce', price: 0, category: 'Chicken Flavor', is_available: true },
  { id: 'addon-8', name: 'Teriyaki Sauce', price: 0, category: 'Chicken Flavor', is_available: true },

  // Standard Extras
  { id: 'addon-9', name: 'Extra Espresso Shot', price: 20, category: 'Coffee Extra', is_available: true },
  { id: 'addon-10', name: 'Extra Steamed Rice', price: 15, category: 'Sides', is_available: true },
  { id: 'addon-11', name: 'Extra Dip / Sauce', price: 15, category: 'Sauce', is_available: true },
];

export const INITIAL_PRODUCTS: Product[] = [
  // --- COFFEE-BASED DRINKS (12oz @ ₱59, 16oz @ ₱75) ---
  {
    id: 'prod-1',
    category_id: 'cat-1',
    name: 'Spanish Latte',
    description: 'Rich espresso with creamy milk and sweet condensed milk.',
    base_price: 59,
    image_url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80',
    emoji_icon: '☕',
    is_available: true,
    variants: [
      { id: 'var-1-1', name: '12oz', price_adjustment: 0, is_default: true },
      { id: 'var-1-2', name: '16oz', price_adjustment: 16 },
    ]
  },
  {
    id: 'prod-2',
    category_id: 'cat-1',
    name: 'Vanilla Latte',
    description: 'Smooth espresso blended with sweet vanilla syrup and chilled milk.',
    base_price: 59,
    image_url: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=600&q=80',
    emoji_icon: '☕',
    is_available: true,
    variants: [
      { id: 'var-2-1', name: '12oz', price_adjustment: 0, is_default: true },
      { id: 'var-2-2', name: '16oz', price_adjustment: 16 },
    ]
  },
  {
    id: 'prod-3',
    category_id: 'cat-1',
    name: 'Caramel Macchiato',
    description: 'Fresh espresso, velvety milk, vanilla syrup topped with buttery caramel drizzle.',
    base_price: 59,
    image_url: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=600&q=80',
    emoji_icon: '🧋',
    is_available: true,
    variants: [
      { id: 'var-3-1', name: '12oz', price_adjustment: 0, is_default: true },
      { id: 'var-3-2', name: '16oz', price_adjustment: 16 },
    ]
  },
  {
    id: 'prod-4',
    category_id: 'cat-1',
    name: 'Iced Mocha',
    description: 'Rich espresso layered with decadent chocolate and creamy milk over ice.',
    base_price: 59,
    image_url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80',
    emoji_icon: '🍫',
    is_available: true,
    variants: [
      { id: 'var-4-1', name: '12oz', price_adjustment: 0, is_default: true },
      { id: 'var-4-2', name: '16oz', price_adjustment: 16 },
    ]
  },
  {
    id: 'prod-5',
    category_id: 'cat-1',
    name: 'Matcha Espresso Latte',
    description: 'Layered fusion of Japanese matcha tea with a bold shot of espresso.',
    base_price: 59,
    image_url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=600&q=80',
    emoji_icon: '🍵',
    is_available: true,
    variants: [
      { id: 'var-5-1', name: '12oz', price_adjustment: 0, is_default: true },
      { id: 'var-5-2', name: '16oz', price_adjustment: 16 },
    ]
  },
  {
    id: 'prod-6',
    category_id: 'cat-1',
    name: 'Oreo Espresso Latte',
    description: 'Espresso latte combined with crushed Oreo cookies for a sweet crunch.',
    base_price: 59,
    image_url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=600&q=80',
    emoji_icon: '🍪',
    is_available: true,
    variants: [
      { id: 'var-6-1', name: '12oz', price_adjustment: 0, is_default: true },
      { id: 'var-6-2', name: '16oz', price_adjustment: 16 },
    ]
  },
  {
    id: 'prod-7',
    category_id: 'cat-1',
    name: 'Iced Americano',
    description: 'Clean and bold espresso diluted with filtered chilled water and ice.',
    base_price: 59,
    image_url: 'https://images.unsplash.com/photo-1551030173-122aabc4489c?auto=format&fit=crop&w=600&q=80',
    emoji_icon: '🥤',
    is_available: true,
    variants: [
      { id: 'var-7-1', name: '12oz', price_adjustment: 0, is_default: true },
      { id: 'var-7-2', name: '16oz', price_adjustment: 16 },
    ]
  },

  // --- NON-COFFEE DRINKS ---
  {
    id: 'prod-8',
    category_id: 'cat-2',
    name: 'Milky-Berry Matcha',
    description: 'Creamy milk infused with sweet berry and Japanese matcha blend.',
    base_price: 59,
    image_url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=600&q=80',
    emoji_icon: '🍵',
    is_available: true,
    variants: [
      { id: 'var-8-1', name: '12oz', price_adjustment: 0, is_default: true },
      { id: 'var-8-2', name: '16oz', price_adjustment: 16 }, // ₱75
    ]
  },
  {
    id: 'prod-9',
    category_id: 'cat-2',
    name: 'Oreo Matcha Latte',
    description: 'Matcha latte layered with rich crushed Oreo cookie crumbs.',
    base_price: 59,
    image_url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=600&q=80',
    emoji_icon: '🍪',
    is_available: true,
    variants: [
      { id: 'var-9-1', name: '12oz', price_adjustment: 0, is_default: true },
      { id: 'var-9-2', name: '16oz', price_adjustment: 16 }, // ₱75
    ]
  },
  {
    id: 'prod-10',
    category_id: 'cat-2',
    name: 'Matcha Latte',
    description: 'Smooth Japanese matcha whisked with fresh whole milk.',
    base_price: 59,
    image_url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=600&q=80',
    emoji_icon: '🍵',
    is_available: true,
    variants: [
      { id: 'var-10-1', name: '12oz', price_adjustment: 0, is_default: true },
      { id: 'var-10-2', name: '16oz', price_adjustment: 16 }, // ₱75
    ]
  },
  {
    id: 'prod-11',
    category_id: 'cat-2',
    name: 'Pure Matcha',
    description: 'Authentic pure matcha flavor served chilled and refreshing.',
    base_price: 59,
    image_url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=600&q=80',
    emoji_icon: '🍵',
    is_available: true,
    variants: [
      { id: 'var-11-1', name: '12oz', price_adjustment: 0, is_default: true },
      { id: 'var-11-2', name: '16oz', price_adjustment: 16 }, // ₱75
    ]
  },
  {
    id: 'prod-12',
    category_id: 'cat-2',
    name: 'Milky-Berry Oreo',
    description: 'Delightful blend of berry, creamy milk, and chocolatey Oreo.',
    base_price: 59,
    image_url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=600&q=80',
    emoji_icon: '🍓',
    is_available: true,
    variants: [
      { id: 'var-12-1', name: '12oz', price_adjustment: 0, is_default: true },
      { id: 'var-12-2', name: '16oz', price_adjustment: 11 }, // ₱70
    ]
  },
  {
    id: 'prod-13',
    category_id: 'cat-2',
    name: 'Milky Strawberry',
    description: 'Sweet strawberry puree swirled with creamy fresh milk.',
    base_price: 59,
    image_url: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=600&q=80',
    emoji_icon: '🍓',
    is_available: true,
    variants: [
      { id: 'var-13-1', name: '12oz', price_adjustment: 0, is_default: true },
      { id: 'var-13-2', name: '16oz', price_adjustment: 11 }, // ₱70
    ]
  },
  {
    id: 'prod-14',
    category_id: 'cat-2',
    name: 'Milky Oreo',
    description: 'Classic rich milk beverage loaded with crushed Oreo cookie bits.',
    base_price: 59,
    image_url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=600&q=80',
    emoji_icon: '🥛',
    is_available: true,
    variants: [
      { id: 'var-14-1', name: '12oz', price_adjustment: 0, is_default: true },
      { id: 'var-14-2', name: '16oz', price_adjustment: 11 }, // ₱70
    ]
  },

  // --- FRUIT SODA (16oz @ ₱60) ---
  {
    id: 'prod-15',
    category_id: 'cat-3',
    name: 'Blue Lemonade',
    description: 'Refreshing blue citrus lemonade sparkling soda.',
    base_price: 60,
    image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
    emoji_icon: '🍋',
    is_available: true,
    variants: [
      { id: 'var-15-1', name: '16oz', price_adjustment: 0, is_default: true },
    ]
  },
  {
    id: 'prod-16',
    category_id: 'cat-3',
    name: 'Green Apple',
    description: 'Crisp green apple fruit soda served ice cold.',
    base_price: 60,
    image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
    emoji_icon: '🍏',
    is_available: true,
    variants: [
      { id: 'var-16-1', name: '16oz', price_adjustment: 0, is_default: true },
    ]
  },
  {
    id: 'prod-17',
    category_id: 'cat-3',
    name: 'Strawberry',
    description: 'Sweet strawberry sparkling fruit soda.',
    base_price: 60,
    image_url: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=600&q=80',
    emoji_icon: '🍓',
    is_available: true,
    variants: [
      { id: 'var-17-1', name: '16oz', price_adjustment: 0, is_default: true },
    ]
  },
  {
    id: 'prod-18',
    category_id: 'cat-3',
    name: 'Blueberry',
    description: 'Fruity blueberry soda topped with ice.',
    base_price: 60,
    image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
    emoji_icon: '🫐',
    is_available: true,
    variants: [
      { id: 'var-18-1', name: '16oz', price_adjustment: 0, is_default: true },
    ]
  },

  // --- CHICKEN MENU ---
  {
    id: 'prod-19',
    category_id: 'cat-4',
    name: 'Chicken Tenders',
    description: 'Crispy fried chicken tenders with your choice of flavor sauce.',
    base_price: 169,
    image_url: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80',
    emoji_icon: '🍗',
    is_available: true,
  },
  {
    id: 'prod-20',
    category_id: 'cat-4',
    name: 'Chicken Tenders w/ Fries',
    description: 'Golden chicken tenders paired with a generous side of french fries.',
    base_price: 149,
    image_url: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80',
    emoji_icon: '🍟',
    is_available: true,
  },
  {
    id: 'prod-21',
    category_id: 'cat-4',
    name: 'Chicken Puffers',
    description: 'Bite-sized crunchy chicken puffers coated in your favorite sauce.',
    base_price: 99,
    image_url: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80',
    emoji_icon: '🍿',
    is_available: true,
  },
  {
    id: 'prod-22',
    category_id: 'cat-4',
    name: 'Chicken Puffers w/ Rice',
    description: 'Delicious chicken puffers served over hot steamed white rice.',
    base_price: 69,
    image_url: 'https://images.unsplash.com/photo-1588165171080-c89acfa5ee83?auto=format&fit=crop&w=600&q=80',
    emoji_icon: '🍚',
    is_available: true,
  },

  // --- FRENCH FRIES ---
  {
    id: 'prod-23',
    category_id: 'cat-5',
    name: 'French Fries',
    description: 'Crispy golden french fries available in BBQ, Sour Cream, or Cheese flavor.',
    base_price: 75,
    image_url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80',
    emoji_icon: '🍟',
    is_available: true,
  }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'inv-1', name: 'Arabica Espresso Beans', category: 'Coffee Beans', unit: 'g', current_stock: 5000, min_stock_alert: 1000, cost_per_unit: 0.80, supplier_name: 'Local Roastery' },
  { id: 'inv-2', name: 'Fresh Whole Milk', category: 'Dairy', unit: 'ml', current_stock: 15000, min_stock_alert: 3000, cost_per_unit: 0.09, supplier_name: 'Metro Dairy' },
  { id: 'inv-3', name: 'Condensed Milk', category: 'Dairy', unit: 'ml', current_stock: 3000, min_stock_alert: 500, cost_per_unit: 0.12, supplier_name: 'Metro Dairy' },
  { id: 'inv-4', name: 'Vanilla Syrup', category: 'Syrups', unit: 'ml', current_stock: 2000, min_stock_alert: 400, cost_per_unit: 0.45, supplier_name: 'Barista Supplies' },
  { id: 'inv-5', name: 'Caramel Drizzle', category: 'Syrups', unit: 'ml', current_stock: 1500, min_stock_alert: 300, cost_per_unit: 0.50, supplier_name: 'Barista Supplies' },
  { id: 'inv-6', name: 'Matcha Powder', category: 'Tea & Flavors', unit: 'g', current_stock: 1000, min_stock_alert: 200, cost_per_unit: 1.50, supplier_name: 'Matcha Imports' },
  { id: 'inv-7', name: 'Oreo Crushed Cookies', category: 'Toppings', unit: 'g', current_stock: 2000, min_stock_alert: 500, cost_per_unit: 0.30, supplier_name: 'Snack Supply Co' },
  { id: 'inv-8', name: 'Fruit Soda Syrup (Blue/Green/Berry)', category: 'Syrups', unit: 'ml', current_stock: 4000, min_stock_alert: 800, cost_per_unit: 0.25, supplier_name: 'Beverage Craft' },
  { id: 'inv-9', name: 'Chicken Fillets / Tenders', category: 'Poultry', unit: 'g', current_stock: 10000, min_stock_alert: 2000, cost_per_unit: 0.22, supplier_name: 'Poultry Fresh' },
  { id: 'inv-10', name: 'French Fries Cut', category: 'Frozen Snacks', unit: 'g', current_stock: 12000, min_stock_alert: 2500, cost_per_unit: 0.15, supplier_name: 'Frozen Foods Supplier' },
  { id: 'inv-11', name: 'Fries Flavoring Powders', category: 'Seasoning', unit: 'g', current_stock: 3000, min_stock_alert: 500, cost_per_unit: 0.20, supplier_name: 'Flavor Tech' },
  { id: 'inv-12', name: '12oz Plastic Cups', category: 'Packaging', unit: 'pcs', current_stock: 500, min_stock_alert: 100, cost_per_unit: 3.50, supplier_name: 'EcoPack' },
  { id: 'inv-13', name: '16oz Plastic Cups', category: 'Packaging', unit: 'pcs', current_stock: 500, min_stock_alert: 100, cost_per_unit: 4.00, supplier_name: 'EcoPack' },
];

export const INITIAL_RECIPES: ProductIngredient[] = [
  { id: 'rec-1', product_id: 'prod-1', inventory_item_id: 'inv-1', quantity_required: 18 },
  { id: 'rec-2', product_id: 'prod-1', inventory_item_id: 'inv-2', quantity_required: 150 },
  { id: 'rec-3', product_id: 'prod-1', inventory_item_id: 'inv-3', quantity_required: 30 },
  { id: 'rec-4', product_id: 'prod-1', inventory_item_id: 'inv-12', quantity_required: 1 },

  { id: 'rec-5', product_id: 'prod-23', inventory_item_id: 'inv-10', quantity_required: 150 },
  { id: 'rec-6', product_id: 'prod-23', inventory_item_id: 'inv-11', quantity_required: 15 },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'cust-1', name: 'Maria Santos', phone: '09171234567', email: 'maria.s@gmail.com', loyalty_points: 120, total_spent: 2400, total_orders: 14, created_at: '2026-08-10' },
  { id: 'cust-2', name: 'Juan Dela Cruz', phone: '09189876543', email: 'juan.dc@yahoo.com', loyalty_points: 65, total_spent: 1350, total_orders: 8, created_at: '2026-08-15' },
];

export const INITIAL_DISCOUNTS: Discount[] = [
  { id: 'disc-1', code: 'SENIOR', name: 'Senior Citizen Discount (20%)', discount_type: 'senior_pwd', value: 20, is_active: true },
  { id: 'disc-2', code: 'PWD', name: 'PWD Discount (20%)', discount_type: 'senior_pwd', value: 20, is_active: true },
  { id: 'disc-3', code: 'PROMO10', name: 'Special Promo (10% Off)', discount_type: 'percentage', value: 10, is_active: true },
];

export const INITIAL_EXPENSES: Expense[] = [
  { id: 'exp-1', category: 'Utilities', title: 'Electricity Bill', amount: 4500, expense_date: '2026-09-02', notes: 'Monthly shop power', created_at: '2026-09-02T10:00:00Z' },
  { id: 'exp-2', category: 'Supplies', title: 'Coffee Beans & Milk Stock', amount: 3800, expense_date: '2026-09-05', notes: 'Weekly replenishment', created_at: '2026-09-05T10:00:00Z' },
];

export const INITIAL_SHOP_SETTINGS: ShopSettings = {
  shop_name: '8307 Coffee',
  tagline: 'SIMPLE MOMENTS. PERFECT BREWS.',
  logo_url: '/8307.jpg',
  address: 'Lianga, Surigao del Sur',
  phone: '09157078046 / 09772723690',
  email: '8307coffee@gmail.com',
  tax_rate: 0,
  service_charge_rate: 0,
  gcash_number: '09157078046',
  maya_number: '09772723690',
  receipt_header: 'Welcome to 8307 Coffee!\nSIMPLE MOMENTS. PERFECT BREWS.',
  receipt_footer: 'Thank you for brewing with us!\nFollow us @8307 COFFEE on Facebook',
  auto_lock_minutes: 15,
};

export const INITIAL_ORDERS: Order[] = [];
