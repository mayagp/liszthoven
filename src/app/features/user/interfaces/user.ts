import { Staff } from '../../staff/interfaces/staff';
import { Supplier } from '../../supplier/interfaces/supplier';

export interface User {
  id: string;
  name: string;
  identification_number: string;
  bpjs_number: string;
  tax_number: string;
  working_since: string;
  phone_no: string;
  address: string;
  email: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: any;
  profile_url: string;
  staff: Staff;
  supplier: Supplier;
}
