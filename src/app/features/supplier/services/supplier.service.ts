import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { DataListParameter } from '../../../shared/interfaces/data-list-parameter.interface';

const ROOT_API = environment.API_URL;

@Injectable({
  providedIn: 'root',
})
export class SupplierService {
  constructor(private http: HttpClient) {}

  getSuppliers(dataListParameter: DataListParameter = {} as DataListParameter) {
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
      param = param.concat('&' + dataListParameter.filterObj);
    }

    if (dataListParameter.searchQuery) {
      if (!dataListParameter.sortBy) {
        param = param.concat('?q=' + dataListParameter.searchQuery);
      } else {
        param = param.concat('&q=' + dataListParameter.searchQuery);
      }
    }
    return this.http.get(`${ROOT_API}/admin/suppliers${param}`);
  }
  getSupplier(id: string) {
    return this.http.get(`${ROOT_API}/admin/suppliers/${id}`);
  }
  addSupplier(supplier: any) {
    return this.http.post(`${ROOT_API}/admin/suppliers`, supplier);
  }
  updateSupplier(id: string, supplier: any) {
    return this.http.put(`${ROOT_API}/admin/suppliers/${id}`, supplier);
  }
  deleteSupplier(id: string) {
    return this.http.delete(`${ROOT_API}/admin/suppliers/${id}`);
  }
  getSupplierBankAccounts(id: string) {
    return this.http.get(`${ROOT_API}/admin/suppliers/${id}/details`);
  }
  addSupplierBankAccount(id: string, supplierBankAccount: any) {
    return this.http.post(
      `${ROOT_API}/admin/suppliers/${id}/details`,
      supplierBankAccount,
    );
  }
  updateSupplierBankAccount(
    id: string,
    supplierBankAccountId: string,
    supplierBankAccount: any,
  ) {
    return this.http.put(
      `${ROOT_API}/admin/suppliers/${id}/details/${supplierBankAccountId}`,
      supplierBankAccount,
    );
  }
  deleteSupplierBankAccount(id: string, supplierBankAccountId: string) {
    return this.http.delete(
      `${ROOT_API}/admin/suppliers/${id}/details/${supplierBankAccountId}`,
    );
  }
}
