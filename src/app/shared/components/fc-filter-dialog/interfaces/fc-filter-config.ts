export interface FcFilterConfig {
  filterFields: filterFields[];
  filterRanges?: FilterRange[];
  filterDates?: FilterDate[];
  filterOptions?: FilterOption[];
  sort: Sort;
}

export interface Sort {
  fields: any;
  selectedField: string;
  direction: string;
}
export interface FilterOption {
  options: any;
  optionLabel: any;
  optionValue: any;
  selectedValue: any;
}
export interface filterFields {
  name: string;
  type: string;
  header: string;
  component?: any;
  valueLabelBy?: any;
  valueLabel?: any;
  value?: any;
}
export interface FilterRange {
  header: string;
  type: string;
  field: string;
  start?: any;
  end?: any;
  isActive?: boolean;
}
export interface FilterDate {
  type: string;
  field: string;
  header: string;
  start: Date;
  end: Date;
  isActive?: boolean;
}
