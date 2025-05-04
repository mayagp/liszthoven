import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { DataListParameter } from '../../../shared/interfaces/data-list-parameter.interface';

const ROOT_API = environment.API_URL;

@Injectable({
  providedIn: 'root',
})
export class PurchaseInvoiceService {
  constructor(private http: HttpClient) {}

  getPurchaseInvoices(
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
    return this.http.get(`${ROOT_API}/admin/purchase-invoices${param}`);
  }

  getPurchaseInvoice(id: string) {
    return this.http.get(`${ROOT_API}/admin/purchase-invoices/${id}`);
  }

  addPurchaseInvoice(purchaseInvoice: any) {
    return this.http.post(
      `${ROOT_API}/admin/purchase-invoices`,
      purchaseInvoice,
    );
  }

  updatePurchaseInvoice(id: string, purchaseInvoice: any) {
    return this.http.put(
      `${ROOT_API}/admin/purchase-invoices/${id}`,
      purchaseInvoice,
    );
  }

  deletePurchaseInvoice(id: string) {
    return this.http.delete(`${ROOT_API}/admin/purchase-invoices/${id}`);
  }

  // Purchase Invoice Detail Services
  addPurchaseInvoiceDetail(id: string, purchaseInvoice: any) {
    return this.http.post(
      `${ROOT_API}/admin/purchase-invoices/${id}/details`,
      purchaseInvoice,
    );
  }

  updatePurchaseInvoiceDetail(
    id: string,
    purchaseInvoice: any,
    purchaseInvoiceDetailId: string,
  ) {
    return this.http.put(
      `${ROOT_API}/admin/purchase-invoices/${id}/details/${purchaseInvoiceDetailId}`,
      purchaseInvoice,
    );
  }

  deletePurchaseInvoiceDetail(id: string, purchaseInvoiceDetailId: string) {
    return this.http.delete(
      `${ROOT_API}/admin/purchase-invoices/${id}/details/${purchaseInvoiceDetailId}`,
    );
  }
  approvePurchaseInvoice(id: string) {
    return this.http.put(
      `${ROOT_API}/admin/purchase-invoices/${id}/approve`,
      {},
    );
  }
  approvalRequestPurchaseInvoice(id: string) {
    return this.http.put(
      `${ROOT_API}/admin/purchase-invoices/${id}/approval-request`,
      {},
    );
  }
  cancelPurchaseInvoice(id: string) {
    return this.http.put(
      `${ROOT_API}/admin/purchase-invoices/${id}/cancel`,
      {},
    );
  }

  // Documents
  addPurchaseInvoiceDocument(id: string, documents: any) {
    return this.http.post(
      `${ROOT_API}/admin/purchase-invoices/${id}/documents`,
      documents,
    );
  }

  updatePurchaseInvoiceDocument(
    id: string,
    documentId: string,
    documents: any,
  ) {
    return this.http.put(
      `${ROOT_API}/admin/purchase-invoices/${id}/documents/${documentId}`,
      documents,
    );
  }

  deletePurchaseInvoiceDocument(id: string, documentId: string) {
    return this.http.delete(
      `${ROOT_API}/admin/purchase-invoices/${id}/documents/${documentId}`,
    );
  }
}
