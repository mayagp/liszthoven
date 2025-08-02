import { Branch } from '../../branch/interfaces/branch';
import { User } from '../../user/interfaces/user';

export interface Staff {
  role_name: string;
  id: string;
  user_id: string;
  note: string;
  role: number;
  user: User;
  branch: Branch;
  branch_id: number;
  working_since: string;
  identification_number: string;
  tax_number: string;
  bpjs_number: string;
  status: number;
  status_name: string;
  created_at: string;
  updated_at: string;
  deleted_at: any;
}
