import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { DataListParameter } from '../../../shared/interfaces/data-list-parameter.interface';

const ROOT_API = environment.API_URL;

@Injectable({
  providedIn: 'root',
})
export class WarehouseService {
  constructor(private http: HttpClient) {}

  getWarehouses(
    dataListParameter: DataListParameter = {} as DataListParameter,
  ) {
    let param = '';
    if (dataListParameter.rows && dataListParameter.page) {
      param = param.concat(
        `?page=${dataListParameter.page}&limit=${dataListParameter.rows}`,
      );
    }
    if (dataListParameter.sortBy) {
      param = param.concat('&' + dataListParameter.sortBy);
    }
    if (dataListParameter.filterObj) {
      param = param.concat(
        '&' + dataListParameter.filterObj + '&with_filter=1',
      );
    }

    if (dataListParameter.searchQuery) {
      if (!dataListParameter.sortBy) {
        param = param.concat('?q=' + dataListParameter.searchQuery);
      } else {
        param = param.concat('&q=' + dataListParameter.searchQuery);
      }
    }
    return this.http.get(`${ROOT_API}/admin/warehouses${param}`);
  }

  getWarehouse(id: string) {
    return this.http.get(`${ROOT_API}/admin/warehouses/${id}`);
  }

  addWarehouse(data: any) {
    return this.http.post(`${ROOT_API}/admin/warehouses`, data);
  }

  updateWarehouse(warehouseId: string, data: any) {
    return this.http.put(`${ROOT_API}/admin/warehouses/${warehouseId}`, data);
  }

  deleteWarehouse(warehouseId: string) {
    return this.http.delete(`${ROOT_API}/admin/warehouses/${warehouseId}`);
  }
}
