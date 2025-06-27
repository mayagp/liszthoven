import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { DataListParameter } from '../../../shared/interfaces/data-list-parameter.interface';

const ROOT_API = environment.API_URL;

@Injectable({
  providedIn: 'root',
})
export class GoodsReceiptService {
  constructor(private http: HttpClient) {}

  getGoodsReceipts(
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
    return this.http.get(`${ROOT_API}/goods-receipts${param}`);
  }

  getGoodsReceipt(id: string) {
    return this.http.get(`${ROOT_API}/goods-receipts/${id}`);
  }

  addGoodsReceipt(goodsReceipt: any) {
    return this.http.post(`${ROOT_API}/goods-receipts`, goodsReceipt);
  }

  updateGoodsReceipt(id: string, goodsReceipt: any) {
    return this.http.put(`${ROOT_API}/goods-receipts/${id}`, goodsReceipt);
  }

  deleteGoodsReceipt(id: string) {
    return this.http.delete(`${ROOT_API}/goods-receipts/${id}`);
  }

  setStatusAsComplete(id: string) {
    return this.http.put(`${ROOT_API}/goods-receipts/${id}/complete`, {});
  }

  setStatusAsCancel(id: string) {
    return this.http.put(`${ROOT_API}/goods-receipts/${id}/cancel`, {});
  }

  // Goods Receipt Detail
  addGoodsReceiptDetail(id: string, goodsReceiptDetail: any) {
    return this.http.post(
      `${ROOT_API}/goods-receipts/${id}/details`,
      goodsReceiptDetail,
    );
  }

  updateGoodsReceiptDetail(
    id: string,
    goodsReceiptDetailId: string,
    goodsReceiptDetail: any,
  ) {
    return this.http.put(
      `${ROOT_API}/goods-receipts/${id}/details/${goodsReceiptDetailId}`,
      goodsReceiptDetail,
    );
  }

  deleteGoodsReceiptDetail(id: string, goodsReceiptDetailId: string) {
    return this.http.delete(
      `${ROOT_API}/goods-receipts/${id}/details/${goodsReceiptDetailId}`,
    );
  }

  // Document Services
  addGoodsReceiptDocuments(id: string, documents: any) {
    return this.http.post(
      `${ROOT_API}/goods-receipts/${id}/documents`,
      documents,
    );
  }

  updateGoodsReceiptDocument(id: string, documentId: string, documents: any) {
    return this.http.put(
      `${ROOT_API}/goods-receipts/${id}/documents/${documentId}`,
      documents,
    );
  }

  deleteGoodsReceiptDocument(id: string, documentId: string) {
    return this.http.delete(
      `${ROOT_API}/goods-receipts/${id}/documents/${documentId}`,
    );
  }
}
