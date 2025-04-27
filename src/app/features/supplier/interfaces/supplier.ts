export interface Supplier {
  id: string;
  name: string;
  contact_no: string;
  tax_no: string;
  pic: string;
  address: string;
  supplier_bank_accounts: SupplierBankAccount[];
}
export interface SupplierBankAccount {
  id: string;
  supplier_id: string;
  account_no: string;
  bank: string;
  swift_code: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
}
