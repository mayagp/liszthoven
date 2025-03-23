import { Staff } from '../../staff/interfaces/staff';

export interface User {
  id: string;
  name: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  identification_number: string;
  bpjs_number: string;
  tax_number: string;
  working_since: string;
  marital_status: number;
  religion: number;
  color: string;
  phone_no: string;
  address: string;
  email: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: any;
  profile_url: string;
  birth_date: string;
  birth_place: string;
  staff: Staff;
}
