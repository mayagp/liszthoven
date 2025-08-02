import { User } from '../../user/interfaces/user';

export interface Supplier {
  id: number;
  user_id: number;
  tax_no: string;
  total_payable: number;
  account_no: string;
  bank: string;
  swift_code: string;
  user: User;
}
