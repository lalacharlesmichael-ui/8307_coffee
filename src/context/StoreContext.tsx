import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type {
  NavigationTab,
  Category,
  Product,
  AddOn,
  CartItem,
  Order,
  OrderType,
  OrderStatus,
  Payment,
  PaymentMethod,
  InventoryItem,
  ProductIngredient,
  InventoryMovement,
  Expense,
  Discount,
  Customer,
  ActivityLog,
  ShopSettings,
  CartItemCustomization,
} from '../types/pos';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_ADD_ONS,
  INITIAL_INVENTORY,
  INITIAL_RECIPES,
  INITIAL_CUSTOMERS,
  INITIAL_DISCOUNTS,
  INITIAL_EXPENSES,
  INITIAL_SHOP_SETTINGS,
  INITIAL_ORDERS,
} from '../data/initialData';
import {
  syncOrderToFirestore,
  syncProductToFirestore,
  deleteProductFromFirestore,
  syncCategoryToFirestore,
  syncInventoryToFirestore,
  syncExpenseToFirestore,
  syncCustomerToFirestore,
  syncLogToFirestore,
  syncSettingsToFirestore,
  syncDiscountToFirestore,
  deleteDiscountFromFirestore,
  COLLECTIONS,
} from '../lib/firestoreSync';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

interface StoreContextType {
  // Navigation & Auth
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
  isLocked: boolean;
  setIsLocked: (val: boolean) => void;
  unlockAdmin: (password: string) => boolean;

  // Shop Settings & System
  settings: ShopSettings;
  updateSettings: (newSettings: Partial<ShopSettings>) => void;

  // Master Data
  categories: Category[];
  products: Product[];
  addOns: AddOn[];
  discounts: Discount[];
  
  // Product CRUD
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  toggleProductAvailability: (id: string) => void;
  archiveProduct: (id: string) => void;

  // Category CRUD
  addCategory: (category: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;

  // Discount CRUD
  addDiscount: (discount: Omit<Discount, 'id'>) => void;
  updateDiscount: (id: string, discount: Partial<Discount>) => void;
  deleteDiscount: (id: string) => void;
  toggleDiscountActive: (id: string) => void;

  // Cart & Active Ordering
  cart: CartItem[];
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  tableNumber: string;
  setTableNumber: (table: string) => void;
  orderNotes: string;
  setOrderNotes: (notes: string) => void;
  selectedDiscount: Discount | null;
  setSelectedDiscount: (disc: Discount | null) => void;
  customDiscountValue: number;
  setCustomDiscountValue: (val: number) => void;
  selectedCustomer: Customer | null;
  setSelectedCustomer: (cust: Customer | null) => void;

  // Cart Operations
  addToCart: (product: Product, customization: CartItemCustomization, qty?: number) => void;
  updateCartQuantity: (cartItemId: string, qty: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;

  // Hold & Resume Orders
  heldOrders: Order[];
  holdCurrentOrder: () => void;
  resumeOrder: (orderId: string) => void;
  deleteHeldOrder: (orderId: string) => void;

  // Checkout & Payment
  processCheckout: (
    paymentMethod: PaymentMethod,
    amountPaid: number,
    referenceNumber?: string
  ) => Order;

  // Orders Management & Kitchen
  orders: Order[];
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  cancelOrRefundOrder: (orderId: string, isRefund: boolean, reason: string) => void;
  
  // Inventory & Recipes
  inventory: InventoryItem[];
  recipes: ProductIngredient[];
  inventoryMovements: InventoryMovement[];
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateInventoryStock: (
    itemId: string,
    quantityChanged: number,
    movementType: 'stock_in' | 'waste' | 'expired' | 'adjustment',
    reason?: string
  ) => void;
  saveRecipe: (productId: string, ingredients: { inventory_item_id: string; quantity_required: number }[]) => void;

  // Expenses & Financials
  expenses: Expense[];
  addExpense: (exp: Omit<Expense, 'id' | 'created_at'>) => void;
  deleteExpense: (id: string) => void;

  // Customers & Loyalty
  customers: Customer[];
  addCustomer: (cust: Omit<Customer, 'id' | 'loyalty_points' | 'total_spent' | 'total_orders' | 'created_at'>) => void;
  redeemLoyaltyPoints: (customerId: string, pointsToRedeem: number) => boolean;

  // Activity Logs
  activityLogs: ActivityLog[];
  logActivity: (action: string, details: string) => void;

  // System Utilities
  resetToSampleData: () => void;
  getLowStockItems: () => InventoryItem[];
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = '8307_COFFEE_POS_STATE_V3';

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('pos');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // Default Admin authenticated
  const [isLocked, setIsLocked] = useState<boolean>(false);

  // Load persistent state or default initial data
  const loadInitialState = () => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.products && Array.isArray(parsed.products) && parsed.products.length >= INITIAL_PRODUCTS.length) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load local storage state:', e);
    }
    return {
      settings: INITIAL_SHOP_SETTINGS,
      categories: INITIAL_CATEGORIES,
      products: INITIAL_PRODUCTS,
      addOns: INITIAL_ADD_ONS,
      inventory: INITIAL_INVENTORY,
      recipes: INITIAL_RECIPES,
      customers: INITIAL_CUSTOMERS,
      discounts: INITIAL_DISCOUNTS,
      expenses: INITIAL_EXPENSES,
      orders: INITIAL_ORDERS,
      heldOrders: [],
      inventoryMovements: [],
      activityLogs: [
        {
          id: 'log-1',
          action: 'System Start',
          details: '8307 Coffee POS initialized with complete menu of foods and drinks.',
          performed_by: 'Admin',
          created_at: new Date().toISOString(),
        }
      ],
    };
  };

  const initialState = loadInitialState();

  const [settings, setSettings] = useState<ShopSettings>(initialState.settings);
  const [categories, setCategories] = useState<Category[]>(initialState.categories);
  const [products, setProducts] = useState<Product[]>(initialState.products);
  const [addOns, setAddOns] = useState<AddOn[]>(initialState.addOns);
  const [inventory, setInventory] = useState<InventoryItem[]>(initialState.inventory);
  const [recipes, setRecipes] = useState<ProductIngredient[]>(initialState.recipes);
  const [customers, setCustomers] = useState<Customer[]>(initialState.customers);
  const [discounts, setDiscounts] = useState<Discount[]>(initialState.discounts);
  const [expenses, setExpenses] = useState<Expense[]>(initialState.expenses);
  const [orders, setOrders] = useState<Order[]>(initialState.orders);
  const [heldOrders, setHeldOrders] = useState<Order[]>(initialState.heldOrders || []);
  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>(initialState.inventoryMovements || []);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(initialState.activityLogs || []);

  // Active Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>('dine_in');
  const [customerName, setCustomerName] = useState<string>('');
  const [tableNumber, setTableNumber] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null);
  const [customDiscountValue, setCustomDiscountValue] = useState<number>(0);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Sync state to local storage
  useEffect(() => {
    const stateToSave = {
      settings,
      categories,
      products,
      addOns,
      inventory,
      recipes,
      customers,
      discounts,
      expenses,
      orders,
      heldOrders,
      inventoryMovements,
      activityLogs,
    };
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [
    settings,
    categories,
    products,
    addOns,
    inventory,
    recipes,
    customers,
    discounts,
    expenses,
    orders,
    heldOrders,
    inventoryMovements,
    activityLogs,
  ]);

  // Real-time Firestore Listeners
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    // Listen to Products in Firestore
    const unsubProducts = onSnapshot(collection(db, COLLECTIONS.PRODUCTS), (snapshot) => {
      if (!snapshot.empty) {
        const firestoreProds: Product[] = [];
        snapshot.forEach((docSnap) => {
          firestoreProds.push({ ...docSnap.data(), id: docSnap.id } as Product);
        });

        const firestoreMap = new Map<string, Product>();
        firestoreProds.forEach((p) => firestoreMap.set(p.id, p));

        const mergedProds: Product[] = [];

        // 1. Add/Update all INITIAL_PRODUCTS (ensuring no missing menu items or outdated mock prices)
        INITIAL_PRODUCTS.forEach((initProd) => {
          const fsProd = firestoreMap.get(initProd.id);
          if (!fsProd) {
            // Missing in Firestore -> sync to Firestore & include in state
            syncProductToFirestore(initProd);
            mergedProds.push(initProd);
          } else if (fsProd.id === 'prod-1' && fsProd.base_price === 130) {
            // Overwrite old boilerplate Spanish Latte ₱130 from early test data with authentic menu item
            syncProductToFirestore(initProd);
            mergedProds.push(initProd);
          } else {
            mergedProds.push(fsProd);
          }
        });

        // 2. Preserve any user-added custom products in Firestore
        firestoreProds.forEach((fsProd) => {
          if (!INITIAL_PRODUCTS.some((ip) => ip.id === fsProd.id)) {
            mergedProds.push(fsProd);
          }
        });

        setProducts(mergedProds);
      } else {
        // If Firestore products collection is empty, seed all INITIAL_PRODUCTS
        INITIAL_PRODUCTS.forEach((p) => {
          syncProductToFirestore(p);
        });
        setProducts(INITIAL_PRODUCTS);
      }
    });

    // Listen to Categories in Firestore
    const unsubCats = onSnapshot(collection(db, COLLECTIONS.CATEGORIES), (snapshot) => {
      if (!snapshot.empty) {
        const firestoreCats: Category[] = [];
        snapshot.forEach((docSnap) => {
          firestoreCats.push({ ...docSnap.data(), id: docSnap.id } as Category);
        });

        const firestoreCatMap = new Map<string, Category>();
        firestoreCats.forEach((c) => firestoreCatMap.set(c.id, c));

        const mergedCats: Category[] = [...firestoreCats];

        INITIAL_CATEGORIES.forEach((initCat) => {
          if (!firestoreCatMap.has(initCat.id)) {
            syncCategoryToFirestore(initCat);
            mergedCats.push(initCat);
          }
        });

        setCategories(mergedCats);
      } else {
        INITIAL_CATEGORIES.forEach((c) => {
          syncCategoryToFirestore(c);
        });
        setCategories(INITIAL_CATEGORIES);
      }
    });

    // Listen to Orders in Firestore (sorted newest-first)
    const unsubOrders = onSnapshot(collection(db, COLLECTIONS.ORDERS), (snapshot) => {
      if (!snapshot.empty) {
        const firestoreOrders: Order[] = [];
        snapshot.forEach((docSnap) => {
          firestoreOrders.push({ ...docSnap.data(), id: docSnap.id } as Order);
        });
        firestoreOrders.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setOrders(firestoreOrders);
      }
    });

    // Listen to Inventory in Firestore
    const unsubInv = onSnapshot(collection(db, COLLECTIONS.INVENTORY), (snapshot) => {
      if (!snapshot.empty) {
        const items: InventoryItem[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ ...docSnap.data(), id: docSnap.id } as InventoryItem);
        });
        setInventory(items);
      }
    });

    // Listen to Expenses in Firestore
    const unsubExpenses = onSnapshot(collection(db, COLLECTIONS.EXPENSES), (snapshot) => {
      if (!snapshot.empty) {
        const exps: Expense[] = [];
        snapshot.forEach((docSnap) => {
          exps.push({ ...docSnap.data(), id: docSnap.id } as Expense);
        });
        exps.sort(
          (a, b) => new Date(b.created_at || b.expense_date).getTime() - new Date(a.created_at || a.expense_date).getTime()
        );
        setExpenses(exps);
      }
    });

    // Listen to Customers in Firestore
    const unsubCustomers = onSnapshot(collection(db, COLLECTIONS.CUSTOMERS), (snapshot) => {
      if (!snapshot.empty) {
        const custs: Customer[] = [];
        snapshot.forEach((docSnap) => {
          custs.push({ ...docSnap.data(), id: docSnap.id } as Customer);
        });
        setCustomers(custs);
      }
    });

    // Listen to Settings in Firestore
    const unsubSettings = onSnapshot(collection(db, COLLECTIONS.SETTINGS), (snapshot) => {
      if (!snapshot.empty) {
        snapshot.forEach((docSnap) => {
          if (docSnap.id === 'store_profile') {
            setSettings(docSnap.data() as ShopSettings);
          }
        });
      }
    });

    // Listen to Activity Logs in Firestore
    const unsubLogs = onSnapshot(collection(db, COLLECTIONS.LOGS), (snapshot) => {
      if (!snapshot.empty) {
        const logs: ActivityLog[] = [];
        snapshot.forEach((docSnap) => {
          logs.push({ ...docSnap.data(), id: docSnap.id } as ActivityLog);
        });
        logs.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setActivityLogs(logs);
      }
    });

    // Listen to Discounts in Firestore
    const unsubDiscounts = onSnapshot(collection(db, COLLECTIONS.DISCOUNTS), (snapshot) => {
      if (!snapshot.empty) {
        const firestoreDiscounts: Discount[] = [];
        snapshot.forEach((docSnap) => {
          firestoreDiscounts.push({ ...docSnap.data(), id: docSnap.id } as Discount);
        });
        setDiscounts(firestoreDiscounts);
      }
    });

    return () => {
      unsubProducts();
      unsubCats();
      unsubOrders();
      unsubInv();
      unsubExpenses();
      unsubCustomers();
      unsubSettings();
      unsubLogs();
      unsubDiscounts();
    };
  }, []);

  // Log activity helper
  const logActivity = (action: string, details: string) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      action,
      details,
      performed_by: 'Admin',
      created_at: new Date().toISOString(),
    };
    setActivityLogs((prev) => [newLog, ...prev]);
    syncLogToFirestore(newLog);
  };

  // Auth unlock
  const unlockAdmin = (password: string) => {
    if (password === '8307' || password === 'admin') {
      setIsLocked(false);
      logActivity('Admin Unlock', 'Admin unlocked the POS terminal.');
      return true;
    }
    return false;
  };

  // Settings update
  const updateSettings = (newSettings: Partial<ShopSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    syncSettingsToFirestore(updated);
    logActivity('Settings Updated', 'Admin updated store settings.');
  };

  // Product CRUD
  const addProduct = (prodData: Omit<Product, 'id'>) => {
    const newId = `prod-${Date.now()}`;
    const newProd: Product = { ...prodData, id: newId };
    setProducts((prev) => [...prev, newProd]);
    syncProductToFirestore(newProd);
    logActivity('Add Product', `Added new menu item: ${newProd.name}`);
  };

  const updateProduct = (id: string, updated: Partial<Product>) => {
    let updatedProd: Product | null = null;
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          updatedProd = { ...p, ...updated };
          return updatedProd;
        }
        return p;
      })
    );
    if (updatedProd) {
      syncProductToFirestore(updatedProd);
    }
    logActivity('Update Product', `Updated product details for ID: ${id}`);
  };

  const toggleProductAvailability = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextState = !p.is_available;
          const updated = { ...p, is_available: nextState };
          syncProductToFirestore(updated);
          logActivity(
            'Product Status Change',
            `Marked ${p.name} as ${nextState ? 'Available' : 'Sold Out'}`
          );
          return updated;
        }
        return p;
      })
    );
  };

  const archiveProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    deleteProductFromFirestore(id);
    logActivity('Archive Product', `Archived product ID: ${id}`);
  };

  // Category CRUD
  const addCategory = (catData: Omit<Category, 'id'>) => {
    const newCat: Category = { ...catData, id: `cat-${Date.now()}` };
    setCategories((prev) => [...prev, newCat]);
    syncCategoryToFirestore(newCat);
    logActivity('Add Category', `Created category: ${newCat.name}`);
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    logActivity('Delete Category', `Deleted category ID: ${id}`);
  };

  // Discount CRUD
  const addDiscount = (discData: Omit<Discount, 'id'>) => {
    const newDisc: Discount = { ...discData, id: `disc-${Date.now()}` };
    setDiscounts((prev) => [...prev, newDisc]);
    syncDiscountToFirestore(newDisc);
    logActivity('Add Discount', `Created discount/promo: ${newDisc.name}`);
  };

  const updateDiscount = (id: string, updated: Partial<Discount>) => {
    let updatedDisc: Discount | null = null;
    setDiscounts((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          updatedDisc = { ...d, ...updated };
          return updatedDisc;
        }
        return d;
      })
    );
    if (updatedDisc) {
      syncDiscountToFirestore(updatedDisc);
    }
    logActivity('Update Discount', `Updated discount ID: ${id}`);
  };

  const deleteDiscount = (id: string) => {
    setDiscounts((prev) => prev.filter((d) => d.id !== id));
    deleteDiscountFromFirestore(id);
    logActivity('Delete Discount', `Deleted discount ID: ${id}`);
  };

  const toggleDiscountActive = (id: string) => {
    setDiscounts((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const updated = { ...d, is_active: !d.is_active };
          syncDiscountToFirestore(updated);
          logActivity(
            'Discount Status Change',
            `Marked discount ${d.name} as ${updated.is_active ? 'Active' : 'Inactive'}`
          );
          return updated;
        }
        return d;
      })
    );
  };

  // Cart Operations
  const addToCart = (product: Product, customization: CartItemCustomization, qty = 1) => {
    // Calculate unit price based on base price + variant + add-ons
    let unitPrice = product.base_price;
    if (customization.variant) {
      unitPrice += customization.variant.price_adjustment;
    }
    if (customization.selected_add_ons) {
      customization.selected_add_ons.forEach((addon) => {
        unitPrice += addon.price;
      });
    }
    if (customization.espresso_shots) {
      unitPrice += customization.espresso_shots * 20; // ₱20 per shot
    }
    if (customization.milk_option && customization.milk_option.includes('Oat')) {
      unitPrice += 20;
    } else if (customization.milk_option && customization.milk_option.includes('Almond')) {
      unitPrice += 20;
    } else if (customization.milk_option && customization.milk_option.includes('Soy')) {
      unitPrice += 15;
    }

    const cartItemId = `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    const newItem: CartItem = {
      cart_item_id: cartItemId,
      product,
      customization,
      quantity: qty,
      unit_price: unitPrice,
      total_price: unitPrice * qty,
    };

    setCart((prev) => [...prev, newItem]);
  };

  const updateCartQuantity = (cartItemId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.cart_item_id === cartItemId
          ? { ...item, quantity: qty, total_price: item.unit_price * qty }
          : item
      )
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cart_item_id !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName('');
    setTableNumber('');
    setOrderNotes('');
    setSelectedDiscount(null);
    setCustomDiscountValue(0);
    setSelectedCustomer(null);
  };

  // Hold & Resume Orders
  const holdCurrentOrder = () => {
    if (cart.length === 0) return;

    const subtotal = cart.reduce((sum, item) => sum + item.total_price, 0);
    const holdOrderNumber = `HOLD-${Math.floor(100 + Math.random() * 900)}`;

    const newHoldOrder: Order = {
      id: `hold-${Date.now()}`,
      order_number: holdOrderNumber,
      order_type: orderType,
      customer_name: customerName || 'Guest (Held)',
      table_number: tableNumber,
      status: 'pending',
      subtotal,
      discount_amount: 0,
      tax_amount: 0,
      service_charge: 0,
      total_amount: subtotal,
      special_notes: orderNotes,
      held_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      items: cart.map((item, idx) => ({
        id: `oi-${Date.now()}-${idx}`,
        product_id: item.product.id,
        product_name: item.product.name,
        variant_name: item.customization.variant?.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        customizations: item.customization,
      })),
    };

    setHeldOrders((prev) => [newHoldOrder, ...prev]);
    logActivity('Hold Order', `Held order ${holdOrderNumber} with ${cart.length} items`);
    clearCart();
  };

  const resumeOrder = (orderId: string) => {
    const targetOrder = heldOrders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    // Convert items back to CartItems
    const restoredCartItems: CartItem[] = targetOrder.items.map((item) => {
      const prod = products.find((p) => p.id === item.product_id) || {
        id: item.product_id,
        category_id: 'cat-1',
        name: item.product_name,
        description: '',
        base_price: item.unit_price,
        image_url: '',
        is_available: true,
      };

      return {
        cart_item_id: `cart-resumed-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        product: prod,
        customization: item.customizations || {},
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      };
    });

    setCart(restoredCartItems);
    setOrderType(targetOrder.order_type);
    setCustomerName(targetOrder.customer_name || '');
    setTableNumber(targetOrder.table_number || '');
    setOrderNotes(targetOrder.special_notes || '');

    setHeldOrders((prev) => prev.filter((o) => o.id !== orderId));
    logActivity('Resume Order', `Resumed order ${targetOrder.order_number}`);
  };

  const deleteHeldOrder = (orderId: string) => {
    setHeldOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  // Process Checkout & Auto Inventory Recipe Deduction
  const processCheckout = (
    paymentMethod: PaymentMethod,
    amountPaid: number,
    referenceNumber?: string
  ): Order => {
    const subtotal = cart.reduce((sum, item) => sum + item.total_price, 0);

    // Calculate discount
    let discountAmount = 0;
    let discountTypeLabel = '';

    if (selectedDiscount) {
      if (selectedDiscount.discount_type === 'percentage' || selectedDiscount.discount_type === 'senior_pwd') {
        discountAmount = subtotal * (selectedDiscount.value / 100);
      } else if (selectedDiscount.discount_type === 'fixed') {
        discountAmount = selectedDiscount.value;
      }
      discountTypeLabel = selectedDiscount.name;
    } else if (customDiscountValue > 0) {
      discountAmount = customDiscountValue;
      discountTypeLabel = 'Custom Discount';
    }

    const discountedSubtotal = Math.max(0, subtotal - discountAmount);
    const taxAmount = (discountedSubtotal * settings.tax_rate) / 100;
    const serviceCharge = (discountedSubtotal * settings.service_charge_rate) / 100;
    const totalAmount = Math.round((discountedSubtotal + taxAmount + serviceCharge) * 100) / 100;

    const changeGiven = Math.max(0, amountPaid - totalAmount);
    const existingNums = orders.map((o) => {
      const match = o.order_number?.match(/ORD-8307-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    });
    const maxNum = existingNums.length > 0 ? Math.max(...existingNums, 0) : 0;
    const nextSeqNumber = maxNum + 1;
    const orderNumStr = String(nextSeqNumber).padStart(3, '0');
    const orderNumber = `ORD-8307-${orderNumStr}`;

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      order_id: '',
      payment_method: paymentMethod,
      amount_paid: amountPaid,
      change_given: changeGiven,
      reference_number: referenceNumber,
      status: 'completed',
      created_at: new Date().toISOString(),
    };

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      order_number: orderNumber,
      order_type: orderType,
      customer_id: selectedCustomer?.id,
      customer_name: customerName || selectedCustomer?.name || 'Walk-in Guest',
      table_number: tableNumber,
      status: 'preparing', // Sent directly to preparation!
      subtotal,
      discount_amount: discountAmount,
      discount_type: discountTypeLabel,
      tax_amount: taxAmount,
      service_charge: serviceCharge,
      total_amount: totalAmount,
      special_notes: orderNotes,
      created_at: new Date().toISOString(),
      items: cart.map((item, idx) => ({
        id: `oi-${Date.now()}-${idx}`,
        product_id: item.product.id,
        product_name: item.product.name,
        variant_name: item.customization.variant?.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        customizations: item.customization,
      })),
      payment: newPayment,
    };

    newPayment.order_id = newOrder.id;

    // 1. Save new Order & sync to Firestore
    setOrders((prev) => [newOrder, ...prev]);
    syncOrderToFirestore(newOrder);

    // 2. RECIPE AUTO DEDUCTION OF INVENTORY
    const movementsToAdd: InventoryMovement[] = [];

    setInventory((prevInventory) => {
      let updatedInv = [...prevInventory];

      cart.forEach((cartItem) => {
        // Find recipe ingredients for this product
        const productRecipes = recipes.filter(
          (r) => r.product_id === cartItem.product.id
        );

        productRecipes.forEach((recipe) => {
          const invIndex = updatedInv.findIndex(
            (item) => item.id === recipe.inventory_item_id
          );
          if (invIndex !== -1) {
            const targetItem = updatedInv[invIndex];
            const totalDeduction = recipe.quantity_required * cartItem.quantity;
            const newStock = Math.max(0, targetItem.current_stock - totalDeduction);

            movementsToAdd.push({
              id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              inventory_item_id: targetItem.id,
              inventory_item_name: targetItem.name,
              movement_type: 'sale_deduction',
              quantity_changed: -totalDeduction,
              previous_stock: targetItem.current_stock,
              new_stock: newStock,
              reason: `Sale deduction for ${orderNumber} (${cartItem.product.name} x${cartItem.quantity})`,
              recorded_by: 'System Auto-Deduct',
              created_at: new Date().toISOString(),
            });

            const updatedItem = {
              ...targetItem,
              current_stock: newStock,
              updated_at: new Date().toISOString(),
            };
            updatedInv[invIndex] = updatedItem;
            syncInventoryToFirestore(updatedItem);
          }
        });
      });

      return updatedInv;
    });

    if (movementsToAdd.length > 0) {
      setInventoryMovements((prev) => [...movementsToAdd, ...prev]);
    }

    // 3. Update Customer Loyalty Points (+1 point per ₱50 spent)
    if (selectedCustomer) {
      const pointsEarned = Math.floor(totalAmount / 50);
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === selectedCustomer.id) {
            const updated = {
              ...c,
              loyalty_points: c.loyalty_points + pointsEarned,
              total_spent: c.total_spent + totalAmount,
              total_orders: c.total_orders + 1,
            };
            syncCustomerToFirestore(updated);
            return updated;
          }
          return c;
        })
      );
      logActivity(
        'Loyalty Points Earned',
        `Customer ${selectedCustomer.name} earned ${pointsEarned} points on order ${orderNumber}`
      );
    }

    logActivity(
      'New Sale Completed',
      `Order ${orderNumber} created. Total: ₱${totalAmount.toFixed(
        2
      )} via ${paymentMethod.toUpperCase()}`
    );

    clearCart();
    return newOrder;
  };

  // Orders Status Workflow
  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const completed_at = status === 'served' ? new Date().toISOString() : o.completed_at;
          const updated = { ...o, status, completed_at };
          syncOrderToFirestore(updated);
          logActivity(
            'Order Status Update',
            `Order ${o.order_number} changed to status: ${status.toUpperCase()}`
          );
          return updated;
        }
        return o;
      })
    );
  };

  const cancelOrRefundOrder = (orderId: string, isRefund: boolean, reason: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    const newStatus: OrderStatus = isRefund ? 'refunded' : 'cancelled';

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const updated = { ...o, status: newStatus, refund_reason: reason };
          syncOrderToFirestore(updated);
          return updated;
        }
        return o;
      })
    );

    logActivity(
      isRefund ? 'Order Refunded' : 'Order Cancelled',
      `Order ${targetOrder.order_number} was ${newStatus}. Reason: ${reason}`
    );
  };

  // Inventory & Stock Actions
  const addInventoryItem = (itemData: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = {
      ...itemData,
      id: `inv-${Date.now()}`,
      updated_at: new Date().toISOString(),
    };
    setInventory((prev) => [...prev, newItem]);
    syncInventoryToFirestore(newItem);
    logActivity('Inventory Added', `Added ingredient/supply: ${newItem.name}`);
  };

  const updateInventoryStock = (
    itemId: string,
    quantityChanged: number,
    movementType: 'stock_in' | 'waste' | 'expired' | 'adjustment',
    reason?: string
  ) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const previous_stock = item.current_stock;
          const new_stock = Math.max(0, previous_stock + quantityChanged);

          const movement: InventoryMovement = {
            id: `mov-${Date.now()}`,
            inventory_item_id: item.id,
            inventory_item_name: item.name,
            movement_type: movementType,
            quantity_changed: quantityChanged,
            previous_stock,
            new_stock,
            reason: reason || `${movementType.replace('_', ' ').toUpperCase()}`,
            recorded_by: 'Admin',
            created_at: new Date().toISOString(),
          };

          setInventoryMovements((movs) => [movement, ...movs]);

          logActivity(
            'Stock Adjustment',
            `${item.name} stock changed by ${quantityChanged > 0 ? '+' : ''}${quantityChanged} ${item.unit}. New Stock: ${new_stock}`
          );

          const updatedItem = { ...item, current_stock: new_stock, updated_at: new Date().toISOString() };
          syncInventoryToFirestore(updatedItem);
          return updatedItem;
        }
        return item;
      })
    );
  };

  const saveRecipe = (
    productId: string,
    ingredients: { inventory_item_id: string; quantity_required: number }[]
  ) => {
    setRecipes((prev) => {
      const filtered = prev.filter((r) => r.product_id !== productId);
      const newRecipes: ProductIngredient[] = ingredients.map((ing, idx) => ({
        id: `rec-${Date.now()}-${idx}`,
        product_id: productId,
        inventory_item_id: ing.inventory_item_id,
        quantity_required: ing.quantity_required,
      }));
      return [...filtered, ...newRecipes];
    });

    logActivity('Recipe Updated', `Updated ingredient recipes for Product ID: ${productId}`);
  };

  // Expenses
  const addExpense = (expData: Omit<Expense, 'id' | 'created_at'>) => {
    const newExp: Expense = {
      ...expData,
      id: `exp-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setExpenses((prev) => [newExp, ...prev]);
    syncExpenseToFirestore(newExp);
    logActivity('Expense Recorded', `Recorded ₱${expData.amount} for ${expData.title}`);
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // Customers & Loyalty
  const addCustomer = (
    custData: Omit<Customer, 'id' | 'loyalty_points' | 'total_spent' | 'total_orders' | 'created_at'>
  ) => {
    const newCust: Customer = {
      ...custData,
      id: `cust-${Date.now()}`,
      loyalty_points: 0,
      total_spent: 0,
      total_orders: 0,
      created_at: new Date().toISOString(),
    };
    setCustomers((prev) => [...prev, newCust]);
    syncCustomerToFirestore(newCust);
    logActivity('Customer Added', `Added customer profile: ${newCust.name}`);
  };

  const redeemLoyaltyPoints = (customerId: string, pointsToRedeem: number): boolean => {
    let success = false;
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId && c.loyalty_points >= pointsToRedeem) {
          success = true;
          const updated = { ...c, loyalty_points: c.loyalty_points - pointsToRedeem };
          syncCustomerToFirestore(updated);
          logActivity(
            'Loyalty Points Redeemed',
            `Customer ${c.name} redeemed ${pointsToRedeem} points`
          );
          return updated;
        }
        return c;
      })
    );
    return success;
  };

  // Utilities
  const getLowStockItems = (): InventoryItem[] => {
    return inventory.filter((item) => item.current_stock <= item.min_stock_alert);
  };

  const resetToSampleData = () => {
    setSettings(INITIAL_SHOP_SETTINGS);
    setCategories(INITIAL_CATEGORIES);
    setProducts(INITIAL_PRODUCTS);
    setAddOns(INITIAL_ADD_ONS);
    setInventory(INITIAL_INVENTORY);
    setRecipes(INITIAL_RECIPES);
    setCustomers(INITIAL_CUSTOMERS);
    setDiscounts(INITIAL_DISCOUNTS);
    setExpenses(INITIAL_EXPENSES);
    setOrders(INITIAL_ORDERS);
    setHeldOrders([]);
    setInventoryMovements([]);
    setCart([]);
    logActivity('Data Reset', 'Reset all POS application data to default sample state.');
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  return (
    <StoreContext.Provider
      value={{
        activeTab,
        setActiveTab,
        isAuthenticated,
        setIsAuthenticated,
        isLocked,
        setIsLocked,
        unlockAdmin,

        settings,
        updateSettings,

        categories,
        products,
        addOns,
        discounts,

        addProduct,
        updateProduct,
        toggleProductAvailability,
        archiveProduct,

        addCategory,
        deleteCategory,

        addDiscount,
        updateDiscount,
        deleteDiscount,
        toggleDiscountActive,

        cart,
        orderType,
        setOrderType,
        customerName,
        setCustomerName,
        tableNumber,
        setTableNumber,
        orderNotes,
        setOrderNotes,
        selectedDiscount,
        setSelectedDiscount,
        customDiscountValue,
        setCustomDiscountValue,
        selectedCustomer,
        setSelectedCustomer,

        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,

        heldOrders,
        holdCurrentOrder,
        resumeOrder,
        deleteHeldOrder,

        processCheckout,

        orders,
        updateOrderStatus,
        cancelOrRefundOrder,

        inventory,
        recipes,
        inventoryMovements,
        addInventoryItem,
        updateInventoryStock,
        saveRecipe,

        expenses,
        addExpense,
        deleteExpense,

        customers,
        addCustomer,
        redeemLoyaltyPoints,

        activityLogs,
        logActivity,

        resetToSampleData,
        getLowStockItems,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
