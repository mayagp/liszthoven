export interface ProductCategory {
  id: string;
  name: string;
  category_parent_id: any;
  created_at: string;
  updated_at: string;
  deleted_at: any;
  perspective: boolean;
  subcategories: ProductCategory[];
  selectedSubcategory: ProductCategory | null;
}
