import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { DataListParameter } from '../../../shared/interfaces/data-list-parameter.interface';

const ROOT_API = environment.API_URL;

@Injectable({
  providedIn: 'root',
})
export class PurchaseReturnService {
  constructor(private http: HttpClient) {}

  getPurchaseReturns(
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
    return this.http.get(`${ROOT_API}/admin/purchase-returns${param}`);
  }

  getPurchaseReturn(id: string) {
    return this.http.get(`${ROOT_API}/admin/purchase-returns/${id}`);
  }

  addPurchaseReturn(purchaseReturn: any) {
    return this.http.post(`${ROOT_API}/admin/purchase-returns`, purchaseReturn);
  }

  updatePurchaseReturn(id: string, purchaseReturn: any) {
    return this.http.put(
      `${ROOT_API}/admin/purchase-returns/${id}`,
      purchaseReturn,
    );
  }

  deletePurchaseReturn(id: string) {
    return this.http.delete(`${ROOT_API}/admin/purchase-returns/${id}`);
  }

  setStatusAsComplete(id: string) {
    return this.http.put(
      `${ROOT_API}/admin/purchase-returns/${id}/complete`,
      {},
    );
  }

  setStatusAsCancel(id: string) {
    return this.http.put(
      `${ROOT_API}/admin/purchase-returns/${id}/cancelled`,
      {},
    );
  }

  // Purchase Return Detail
  addPurchaseReturnDetail(purchaseReturnId: string, purchaseReturnDetail: any) {
    return this.http.post(
      `${ROOT_API}/admin/purchase-returns/${purchaseReturnId}/details`,
      purchaseReturnDetail,
    );
  }

  updatePurchaseReturnDetail(
    purchaseReturnId: string,
    purchaseReturnDetailId: string,
    purchaseReturnDetail: any,
  ) {
    return this.http.put(
      `${ROOT_API}/admin/purchase-returns/${purchaseReturnId}/details/${purchaseReturnDetailId}`,
      purchaseReturnDetail,
    );
  }

  deletePurchaseReturnDetail(
    purchaseReturnId: string,
    purchaseReturnDetailId: string,
  ) {
    return this.http.delete(
      `${ROOT_API}/admin/purchase-returns/${purchaseReturnId}/details/${purchaseReturnDetailId}`,
    );
  }

  // Document Services
  addPurchaseReturnDocuments(id: string, documents: any) {
    return this.http.post(
      `${ROOT_API}/admin/purchase-returns/${id}/documents`,
      documents,
    );
  }

  updatePurchaseReturnDocument(id: string, documentId: string, documents: any) {
    return this.http.put(
      `${ROOT_API}/admin/purchase-returns/${id}/documents/${documentId}`,
      documents,
    );
  }

  deletePurchaseReturnDocument(id: string, documentId: string) {
    return this.http.delete(
      `${ROOT_API}/admin/purchase-returns/${id}/documents/${documentId}`,
    );
  }
}
