import { Product } from '../../product/interfaces/product';
import { Warehouse } from '../../warehouse/interfaces/warehouse';

export interface PurchasePlan {
  status_name: string;
  id: string;
  warehouse_id: string;
  product_id: string;
  date: Date;
  quantity: number;
  status: number;
  created_at: Date;
  updated_at: Date;
  warehouse: Warehouse;
  product: Product;
}
