import { BusinessUnit } from '../../branch/interfaces/branch';
import { Product } from '../../product/interfaces/product';
import { Supplier } from '../../supplier/interfaces/supplier';
import { Warehouse } from '../../warehouse/interfaces/warehouse';

export interface PurchaseOrder {
  status_name: string;
  id: string;
  purchase_order_no: string;
  supplier_id: number;
  date: string;
  expected_delivery_date: string;
  status: number;
  subtotal: string;
  tax: string;
  grandtotal: string;
  note: string;
  business_unit_id: number;
  created_by: number;
  approved_at: any;
  approved_by: any;
  created_at: string;
  updated_at: string;
  deleted_at: any;
  supplier: Supplier;
  business_unit: BusinessUnit;
  purchase_order_details: PurchaseOrderDetail[];
  purchase_order_documents: PurchaseOrderDocument[];
}

export interface PurchaseOrderDetail {
  status_name: string;
  id: number;
  quotation_no: string;
  supplier_quotation_id: any;
  purchase_order_id: number;
  product_id: number;
  quantity_ordered: number;
  remaining_quantity: number;
  quantity_received: number;
  price_per_unit: string;
  total: string;
  expected_delivery_date?: string;
  status: number;
  created_at: string;
  updated_at: string;
  deleted_at: any;
  purchase_order_warehouses: PurchaseOrderWarehouse[];
  product: Product;
}

export interface PurchaseOrderDocument {
  id: number;
  purchase_order_id: number;
  original_name: string;
  url: string;
  path: string;
  extension: string;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderWarehouse {
  id: number;
  purchase_order_detail_id: number;
  warehouse_id: number;
  quantity_ordered: number;
  quantity_received: number;
  created_at: string;
  updated_at: string;
  warehouse: Warehouse;
}
