import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { DataListParameter } from '../../../shared/interfaces/data-list-parameter.interface';

const ROOT_API = environment.API_URL;

@Injectable({
  providedIn: 'root',
})
export class SupplierQuotationService {
  constructor(private http: HttpClient) {}

  getSupplierQuotations(
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
      param = param.concat('&' + dataListParameter.filterObj);
    }

    if (dataListParameter.searchQuery) {
      if (!dataListParameter.sortBy) {
        param = param.concat('?q=' + dataListParameter.searchQuery);
      } else {
        param = param.concat('&q=' + dataListParameter.searchQuery);
      }
    }
    return this.http.get(`${ROOT_API}/admin/supplier-quotations${param}`);
  }
  getSupplierQuotation(id: string) {
    return this.http.get(`${ROOT_API}/admin/supplier-quotations/${id}`);
  }
  addSupplierQuotation(supplier: any) {
    return this.http.post(`${ROOT_API}/admin/supplier-quotations`, supplier);
  }
  updateSupplierQuotation(id: string, supplier: any) {
    return this.http.put(
      `${ROOT_API}/admin/supplier-quotations/${id}`,
      supplier,
    );
  }

  receiveSupplierQuotation(id: string) {
    return this.http.put(
      `${ROOT_API}/admin/supplier-quotations/${id}/received`,
      {},
    );
  }

  cancelSupplierQuotation(id: string) {
    return this.http.put(
      `${ROOT_API}/admin/supplier-quotations/${id}/cancelled`,
      {},
    );
  }

  deleteSupplierQuotation(id: string) {
    return this.http.delete(`${ROOT_API}/admin/supplier-quotations/${id}`);
  }

  // Supplier Quotation Detail
  createSupplierQuotationDetail(id: string, bodyReq: any) {
    return this.http.post(
      `${ROOT_API}/admin/supplier-quotations/${id}/details`,
      bodyReq,
    );
  }

  updateSupplierQuotationDetail(
    id: string,
    supplierQuotationId: any,
    bodyReq: any,
  ) {
    return this.http.put(
      `${ROOT_API}/admin/supplier-quotations/${id}/details/${supplierQuotationId}`,
      bodyReq,
    );
  }

  deleteSupplierQuotationDetail(id: string, supplierQuotationId: string) {
    return this.http.delete(
      `${ROOT_API}/admin/supplier-quotations/${id}/details/${supplierQuotationId}`,
    );
  }
}
