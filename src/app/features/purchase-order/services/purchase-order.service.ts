import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { DataListParameter } from '../../../shared/interfaces/data-list-parameter.interface';

const ROOT_API = environment.API_URL;

@Injectable({
  providedIn: 'root',
})
export class PurchaseOrderService {
  constructor(private http: HttpClient) {}

  getPurchaseOrders(
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
    return this.http.get(`${ROOT_API}/admin/purchase-orders${param}`);
  }

  getPurchaseOrder(id: string) {
    return this.http.get(`${ROOT_API}/admin/purchase-orders/${id}`);
  }

  addPurchaseOrder(purchaseOrder: any) {
    return this.http.post(`${ROOT_API}/admin/purchase-orders`, purchaseOrder);
  }

  updatePurchaseOrder(id: string, purchaseOrder: any) {
    return this.http.put(
      `${ROOT_API}/admin/purchase-orders/${id}`,
      purchaseOrder,
    );
  }

  deletePurchaseOrder(id: string) {
    return this.http.delete(`${ROOT_API}/admin/purchase-orders/${id}`);
  }

  cancelPurchaseOrder(id: string) {
    return this.http.put(`${ROOT_API}/admin/purchase-orders/${id}/cancel`, {});
  }
  approvePurchaseOrder(id: string) {
    return this.http.put(`${ROOT_API}/admin/purchase-orders/${id}/approve`, {});
  }

  // Purchase Order Detail Services
  addPurchaseOrderDetail(id: string, purchaseOrder: any) {
    return this.http.post(
      `${ROOT_API}/admin/purchase-orders/${id}/details`,
      purchaseOrder,
    );
  }

  updatePurchaseOrderDetail(
    id: string,
    purchaseOrder: any,
    purchaseOrderDetailId: string,
  ) {
    return this.http.put(
      `${ROOT_API}/admin/purchase-orders/${id}/details/${purchaseOrderDetailId}`,
      purchaseOrder,
    );
  }

  deletePurchaseOrderDetail(id: string, purchaseOrderDetailId: string) {
    return this.http.delete(
      `${ROOT_API}/admin/purchase-orders/${id}/details/${purchaseOrderDetailId}`,
    );
  }

  // Purchase Order Warehouse Services
  addPurchaseOrderWarehouse(
    id: string,
    purchaseOrderDetailId: string,
    purchaseOrderWarehouse: any,
  ) {
    return this.http.post(
      `${ROOT_API}/admin/purchase-orders/${id}/details/${purchaseOrderDetailId}/warehouses`,
      purchaseOrderWarehouse,
    );
  }
  updatePurchaseOrderWarehouse(
    id: string,
    purchaseOrderDetailId: string,
    purchaseOrderWarehouseId: string,
    purchaseOrderWarehouse: any,
  ) {
    return this.http.put(
      `${ROOT_API}/admin/purchase-orders/${id}/details/${purchaseOrderDetailId}/warehouses/${purchaseOrderWarehouseId}`,
      purchaseOrderWarehouse,
    );
  }
  deletePurchaseOrderWarehouse(
    id: string,
    purchaseOrderDetailId: string,
    purchaseOrderWarehouseId: string,
  ) {
    return this.http.delete(
      `${ROOT_API}/admin/purchase-orders/${id}/details/${purchaseOrderDetailId}/warehouses/${purchaseOrderWarehouseId}`,
    );
  }

  // Purchase Order Document Services
  addPurchaseOrderDocument(id: string, documents: any) {
    return this.http.post(
      `${ROOT_API}/admin/purchase-orders/${id}/documents`,
      documents,
    );
  }

  updatePurchaseOrderDocument(id: string, documentId: string, documents: any) {
    return this.http.put(
      `${ROOT_API}/admin/purchase-orders/${id}/documents/${documentId}`,
      documents,
    );
  }

  deletePurchaseOrderDocument(id: string, documentId: string) {
    return this.http.delete(
      `${ROOT_API}/admin/purchase-orders/${id}/documents/${documentId}`,
    );
  }
}
