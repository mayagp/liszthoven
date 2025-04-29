import { BusinessUnit } from '../../branch/interfaces/branch';
import { Product } from '../../product/interfaces/product';

export interface PurchaseRequest {
  id: string;
  purchase_request_no: string;
  date: Date;
  status: PurchaseRequestEnum;
  status_name: string;
  business_unit_id: string;
  created_by: string;
  created_date: Date;
  approved_by: string;
  approved_at: Date;
  business_unit: BusinessUnit;
  purchase_request_details: PurchaseRequestDetail[];
}
export interface PurchaseRequestDetail {
  id: string;
  quantity: number;
  product_id: string;
  product: Product;
  purchase_request_id: string;
}

export enum PurchaseRequestEnum {
  Pending = 0,
  ApprovalRequest = 1,
  Approved = 2,
  Cancelled = 3,
}
