import { Product } from '../../product/interfaces/product';

export interface Inventory {
  id: number;
  product_id: number;
  warehouse_id: number;
  date: string;
  inable_type: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  deleted_at: any;
  remaining_quantity: number;
  inventory_in_transactions: InventoryInTransaction[];
  inventory_out_transactions: InventoryOutTransaction[];
  product: Product;
  loading: boolean;
  showDetail: boolean;
  inventoryDetailLoaded: boolean;
}

export interface InventoryInTransaction {
  id: number;
  inventory_id: number;
  date: string;
  inable_id: number;
  inable_type: string;
  quantity: number;
  remaining_quantity: number;
  cost: string;
  created_at: string;
  updated_at: string;
  deleted_at: any;
  inventory_out_transactions: InventoryOutTransaction[];
}

export interface InventoryOutTransaction {
  id: number;
  inventory_in_transaction_id: number;
  date: string;
  outable_id: number;
  outable_type: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}
