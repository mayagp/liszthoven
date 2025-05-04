import { Product } from '../../product/interfaces/product';
import { PurchaseInvoice } from '../../purchase-invoice/interfaces/purchase-invoice';
import { Supplier } from '../../supplier/interfaces/supplier';
import { Warehouse } from '../../warehouse/interfaces/warehouse';

export interface GoodsReceipt {
  status_name: string;
  id: string;
  purchase_invoice_id: number;
  supplier_id: number;
  warehouse_id: number;
  date: string;
  note: string;
  status: number;
  created_at: string;
  updated_at: string;
  goods_receipt_details: GoodsReceiptDetail[];
  goods_receipt_documents: GoodsReceiptDocument[];
  warehouse: Warehouse;
  supplier: Supplier;
  purchase_invoice: PurchaseInvoice;
  showDetail: boolean;
  goodsReceiptDetailLoaded: boolean;
  loading: boolean;
  goods_receipt_no: string;
}

export interface GoodsReceiptDetail {
  id: number;
  goods_receipt_id: number;
  product_id: number;
  quantity: number;
  created_at: string;
  updated_at: string;
  product: Product;
  gr_serial_numbers: GrSerialNumber[];
}
export interface GoodsReceiptDocument {
  id: number;
  purchase_order_id: number;
  original_name: string;
  url: string;
  path: string;
  extension: string;
  created_at: string;
  updated_at: string;
}

export interface GrSerialNumber {
  id: number;
  goods_receipt_detail_id: number;
  serial_number: string;
  created_at: string;
  updated_at: string;
}
