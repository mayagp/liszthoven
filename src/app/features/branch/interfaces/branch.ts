export interface Branch {
  id: string;
  address: string;
  note: string;
  created_at: string;
  updated_at: string;
  deleted_at: any;
  isExist?: boolean;
  business_units: BusinessUnit;
  email: string;
  phone: string;
  electric_bill_no: string;
  water_bill_no: string;
  internet_bill_no: string;
}

export interface Company {
  id: string;
  name: string;
  note: string;
  created_at: string;
  updated_at: string;
  deleted_at: any;
  branches: Branch[];
  isExist?: boolean;
  showBranches?: boolean;
}

export interface CompanyBranches {
  id: number;
  branch_id: number;
  company_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: any;
}

export interface BusinessUnit {
  id: string;
  branch_id: number;
  company_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: any;
  company: Company;
  branch: Branch;
}
