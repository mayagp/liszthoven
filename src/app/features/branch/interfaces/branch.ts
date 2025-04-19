export interface Branch {
  id: string;
  address: string;
  note: string;
  created_at: string;
  updated_at: string;
  deleted_at: any;
  isExist?: boolean;
  // business_units: BusinessUnit;
  email: string;
  phone: string;
  electric_bill_no: string;
  water_bill_no: string;
  internet_bill_no: string;
}
