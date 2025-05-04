import { BusinessUnit } from '../../branch/interfaces/branch';
import { User } from '../../user/interfaces/user';

export interface Staff {
  role_name: string;
  id: string;
  user_id: string;
  note: string;
  role: number;
  created_at: string;
  updated_at: string;
  deleted_at: any;
  user: User;
  business_units: BusinessUnit[];
  // teacher: Teacher;
  birth_date: string;
  working_since: string;
  identification_number: string;
  tax_number: string;
  bpjs_number: string;
  marital_status: number;
  religion: number;
  color: string;
  selected: boolean;
  tax_category_id: string;
  status: number;
  status_name: string;
}
