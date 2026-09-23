import {
  doc,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import type {
  Product,
  Category,
  Order,
  InventoryItem,
  Expense,
  Customer,
  ActivityLog,
  ShopSettings,
  Discount,
} from '../types/pos';

// Firestore collection references
export const COLLECTIONS = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  ORDERS: 'orders',
  INVENTORY: 'inventory_items',
  EXPENSES: 'expenses',
  CUSTOMERS: 'customers',
  LOGS: 'activity_logs',
  SETTINGS: 'settings',
  DISCOUNTS: 'discounts',
};

// Helper to recursively strip undefined properties so Firestore setDoc does not throw invalid data error
const cleanData = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

// Insert or update Order in Firestore
export const syncOrderToFirestore = async (order: Order) => {
  if (!isFirebaseConfigured) return;
  try {
    const docRef = doc(db, COLLECTIONS.ORDERS, order.id);
    await setDoc(docRef, cleanData(order), { merge: true });
    console.log(`[Firestore] Saved order ${order.order_number}`);
  } catch (error) {
    console.error('[Firestore Error] Failed to save order:', error);
  }
};

// Insert or update Product in Firestore
export const syncProductToFirestore = async (product: Product) => {
  if (!isFirebaseConfigured) return;
  try {
    const docRef = doc(db, COLLECTIONS.PRODUCTS, product.id);
    await setDoc(docRef, cleanData(product), { merge: true });
    console.log(`[Firestore] Saved product ${product.name}`);
  } catch (error) {
    console.error('[Firestore Error] Failed to save product:', error);
  }
};

// Delete Product from Firestore
export const deleteProductFromFirestore = async (productId: string) => {
  if (!isFirebaseConfigured) return;
  try {
    const docRef = doc(db, COLLECTIONS.PRODUCTS, productId);
    await deleteDoc(docRef);
    console.log(`[Firestore] Deleted product ${productId}`);
  } catch (error) {
    console.error('[Firestore Error] Failed to delete product:', error);
  }
};

// Insert or update Category in Firestore
export const syncCategoryToFirestore = async (category: Category) => {
  if (!isFirebaseConfigured) return;
  try {
    const docRef = doc(db, COLLECTIONS.CATEGORIES, category.id);
    await setDoc(docRef, cleanData(category), { merge: true });
  } catch (error) {
    console.error('[Firestore Error] Failed to save category:', error);
  }
};

// Insert or update Inventory item in Firestore
export const syncInventoryToFirestore = async (item: InventoryItem) => {
  if (!isFirebaseConfigured) return;
  try {
    const docRef = doc(db, COLLECTIONS.INVENTORY, item.id);
    await setDoc(docRef, cleanData(item), { merge: true });
  } catch (error) {
    console.error('[Firestore Error] Failed to save inventory item:', error);
  }
};

// Insert Expense in Firestore
export const syncExpenseToFirestore = async (expense: Expense) => {
  if (!isFirebaseConfigured) return;
  try {
    const docRef = doc(db, COLLECTIONS.EXPENSES, expense.id);
    await setDoc(docRef, cleanData(expense), { merge: true });
  } catch (error) {
    console.error('[Firestore Error] Failed to save expense:', error);
  }
};

// Insert Customer in Firestore
export const syncCustomerToFirestore = async (customer: Customer) => {
  if (!isFirebaseConfigured) return;
  try {
    const docRef = doc(db, COLLECTIONS.CUSTOMERS, customer.id);
    await setDoc(docRef, cleanData(customer), { merge: true });
  } catch (error) {
    console.error('[Firestore Error] Failed to save customer:', error);
  }
};

// Insert Activity Log in Firestore
export const syncLogToFirestore = async (log: ActivityLog) => {
  if (!isFirebaseConfigured) return;
  try {
    const docRef = doc(db, COLLECTIONS.LOGS, log.id);
    await setDoc(docRef, cleanData(log), { merge: true });
  } catch (error) {
    console.error('[Firestore Error] Failed to save activity log:', error);
  }
};

// Update Shop Settings in Firestore
export const syncSettingsToFirestore = async (settings: ShopSettings) => {
  if (!isFirebaseConfigured) return;
  try {
    const docRef = doc(db, COLLECTIONS.SETTINGS, 'store_profile');
    await setDoc(docRef, cleanData(settings), { merge: true });
  } catch (error) {
    console.error('[Firestore Error] Failed to save settings:', error);
  }
};

// Insert or update Discount in Firestore
export const syncDiscountToFirestore = async (discount: Discount) => {
  if (!isFirebaseConfigured) return;
  try {
    const docRef = doc(db, COLLECTIONS.DISCOUNTS, discount.id);
    await setDoc(docRef, cleanData(discount), { merge: true });
    console.log(`[Firestore] Saved discount ${discount.name}`);
  } catch (error) {
    console.error('[Firestore Error] Failed to save discount:', error);
  }
};

// Delete Discount from Firestore
export const deleteDiscountFromFirestore = async (discountId: string) => {
  if (!isFirebaseConfigured) return;
  try {
    const docRef = doc(db, COLLECTIONS.DISCOUNTS, discountId);
    await deleteDoc(docRef);
    console.log(`[Firestore] Deleted discount ${discountId}`);
  } catch (error) {
    console.error('[Firestore Error] Failed to delete discount:', error);
  }
};
