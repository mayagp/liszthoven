export interface DataListParameter {
  rows: number;
  page: number;
  sortBy?: string;
  filterObj?: unknown;
  searchQuery?: string;
  filterRange?: string;
}
