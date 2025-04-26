import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DataListParameter } from '../../../shared/interfaces/data-list-parameter.interface';
import { Product } from '../interfaces/product';

const ROOT_API = environment.API_URL;

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  constructor(private http: HttpClient) {}

  getProducts(dataListParameter: DataListParameter = {} as DataListParameter) {
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
    return this.http.get(`${ROOT_API}/admin/products${param}`).pipe(
      map((res: any) => {
        res.data.products = res.data.products.map((product: Product) => {
          return this.setProductDefaultImage(product);
        });
        return res;
      }),
    );
  }
  getProductsByProductCategory(param: string) {
    return this.http.get(`${ROOT_API}/admin/products?${param}`).pipe(
      map((res: any) => {
        res.data.products = res.data.products.map((product: Product) => {
          return this.setProductDefaultImage(product);
        });
        return res;
      }),
    );
  }
  getProduct(id: string) {
    return this.http.get(`${ROOT_API}/admin/products/${id}`);
  }

  addProduct(data: any) {
    return this.http.post(`${ROOT_API}/admin/products`, data);
  }

  updateProduct(productId: string, data: any) {
    return this.http.put(`${ROOT_API}/admin/products/${productId}`, data);
  }

  softDeleteProduct(productId: string) {
    return this.http.delete(`${ROOT_API}/admin/products/${productId}`);
  }

  addProductImage(productId: string, data: any) {
    return this.http.post(
      `${ROOT_API}/admin/products/${productId}/images`,
      data,
    );
  }

  updateProductImage(productId: string, data: any) {
    return this.http.put(
      `${ROOT_API}/admin/products/${productId}/images`,
      data,
    );
  }

  softDeleteProductImage(productId: string, imageId: string) {
    return this.http.delete(
      `${ROOT_API}/admin/products/${productId}/images/${imageId}`,
    );
  }
  setProductDefaultImage(product: Product): Product {
    let default_image = product.product_images.find(
      (image) => image.is_default,
    );
    if (default_image) {
      product.default_image = default_image;
    } else {
      product.default_image = product.product_images[0];
    }
    return product;
  }
}
