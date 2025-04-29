import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { DataListParameter } from '../../../shared/interfaces/data-list-parameter.interface';

const ROOT_API = environment.API_URL;

@Injectable({
  providedIn: 'root',
})
export class PurchaseRequestService {
  constructor(private http: HttpClient) {}

  getPurchaseRequests(
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
      param = param.concat('&with_filter=1');
    }

    if (dataListParameter.searchQuery) {
      if (!dataListParameter.sortBy) {
        param = param.concat('?q=' + dataListParameter.searchQuery);
      } else {
        param = param.concat('&q=' + dataListParameter.searchQuery);
      }
    }
    return this.http.get(`${ROOT_API}/admin/purchase-requests${param}`);
  }

  getPurchaseRequest(id: string) {
    return this.http.get(`${ROOT_API}/admin/purchase-requests/${id}`);
  }

  addPurchaseRequest(purchaseRequest: any) {
    return this.http.post(
      `${ROOT_API}/admin/purchase-requests`,
      purchaseRequest,
    );
  }

  updatePurchaseRequest(id: string, purchaseRequest: any) {
    return this.http.put(
      `${ROOT_API}/admin/purchase-requests/${id}`,
      purchaseRequest,
    );
  }

  deletePurchaseRequest(id: string) {
    return this.http.delete(`${ROOT_API}/admin/purchase-requests/${id}`);
  }

  // Purchase Request Detail Services
  addPurchaseRequestDetail(id: string, purchaseRequest: any) {
    return this.http.post(
      `${ROOT_API}/admin/purchase-requests/${id}/details`,
      purchaseRequest,
    );
  }

  updatePurchaseRequestDetail(
    id: string,
    purchaseRequest: any,
    purchaseRequestDetailId: string,
  ) {
    return this.http.put(
      `${ROOT_API}/admin/purchase-requests/${id}/details/${purchaseRequestDetailId}`,
      purchaseRequest,
    );
  }

  deletePurchaseRequestDetail(id: string, purchaseRequestDetailId: string) {
    return this.http.delete(
      `${ROOT_API}/admin/purchase-requests/${id}/details/${purchaseRequestDetailId}`,
    );
  }
  approvePurchaseRequest(id: string) {
    return this.http.put(
      `${ROOT_API}/admin/purchase-requests/${id}/approved`,
      {},
    );
  }
  approvalRequestPurchaseRequest(id: string) {
    return this.http.put(
      `${ROOT_API}/admin/purchase-requests/${id}/approval-request`,
      {},
    );
  }
  cancelPurchaseRequest(id: string) {
    return this.http.put(
      `${ROOT_API}/admin/purchase-requests/${id}/cancelled`,
      {},
    );
  }
}
