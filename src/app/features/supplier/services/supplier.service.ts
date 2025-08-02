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
    return this.http.get(`${ROOT_API}/suppliers${param}`);
  }
  getSupplier(id: number) {
    return this.http.get(`${ROOT_API}/suppliers/${id}`);
  }
  addSupplier(supplier: any) {
    return this.http.post(`${ROOT_API}/suppliers`, supplier);
  }
  updateSupplier(id: number, supplier: any) {
    return this.http.put(`${ROOT_API}/suppliers/${id}`, supplier);
  }
  deleteSupplier(id: number) {
    return this.http.delete(`${ROOT_API}/suppliers/${id}`);
  }
  getSupplierBankAccounts(id: number) {
    return this.http.get(`${ROOT_API}/suppliers/${id}/details`);
  }
  addSupplierBankAccount(id: number, supplierBankAccount: any) {
    return this.http.post(
      `${ROOT_API}/suppliers/${id}/details`,
      supplierBankAccount,
    );
  }
  updateSupplierBankAccount(
    id: number,
    supplierBankAccountId: string,
    supplierBankAccount: any,
  ) {
    return this.http.put(
      `${ROOT_API}/suppliers/${id}/details/${supplierBankAccountId}`,
      supplierBankAccount,
    );
  }
  deleteSupplierBankAccount(id: string, supplierBankAccountId: string) {
    return this.http.delete(
      `${ROOT_API}/suppliers/${id}/details/${supplierBankAccountId}`,
    );
  }
  updateSupplierBasedOnUser(userId: string, bodyReq: any) {
    return this.http.put(`${ROOT_API}/users/${userId}`, bodyReq);
  }
}
