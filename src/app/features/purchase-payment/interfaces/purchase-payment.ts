import { PurchaseInvoice } from '../../purchase-invoice/interfaces/purchase-invoice';
import { Supplier } from '../../supplier/interfaces/supplier';

export interface PurchasePayment {
  id: string;
  supplier_id: string;
  date: string;
  amount_paid: string;
  payment_method: string;
  note: string;
  status: number;
  status_name: string;
  created_by: number;
  created_at: Date;
  supplier: Supplier;
  purchase_payment_allocations: PurchasePaymentAllocation[];
  purchase_payment_documents: PurchasePaymentDocument[];
  count_invoice: number;
}

export interface PurchasePaymentAllocation {
  id: string;
  purchase_payment_id: string;
  purchase_invoice_id: string;
  amount: string;
  created_by: number;
  purchase_invoice: PurchaseInvoice;
}

export interface PurchasePaymentDocument {
  id: number;
  purchase_order_id: number;
  original_name: string;
  url: string;
  path: string;
  extension: string;
  created_at: string;
  updated_at: string;
}
