import { BusinessUnit } from '../../branch/interfaces/branch';
import { Inventory } from '../../inventory/interfaces/inventory';

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  location: string;
  created_at: string;
  updated_at: string;
  deleted_at: any;
  exist: boolean;
  business_unit: BusinessUnit;
  inventories: Inventory[];
}
