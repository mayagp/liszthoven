import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { DataListParameter } from '../../../shared/interfaces/data-list-parameter.interface';

const ROOT_API = environment.API_URL;

@Injectable({
  providedIn: 'root',
})
export class BranchService {
  constructor(private http: HttpClient) {}

  getBranches(dataListParameter: DataListParameter = {} as DataListParameter) {
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

    return this.http.get(`${ROOT_API}/branches${param}`);
  }

  getBranch(branchId: string) {
    return this.http.get(`${ROOT_API}/branches/${branchId}`);
  }

  addBranch(data: any) {
    return this.http.post(`${ROOT_API}/branches`, data);
  }

  updateBrach(branchId: string, data: any) {
    return this.http.put(`${ROOT_API}/branches/${branchId}`, data);
  }

  deleteBranch(branchId: string) {
    return this.http.delete(`${ROOT_API}/branches/${branchId}`);
  }

  assignBranchToCompany(branchId: string, data: any) {
    return this.http.put(`${ROOT_API}/branches/${branchId}/assign`, data);
  }

  getCompanies(dataListParameter: DataListParameter = {} as DataListParameter) {
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
    return this.http.get(`${ROOT_API}/companies${param}`);
  }

  getCompany(companyId: string) {
    return this.http.get(`${ROOT_API}/companies/${companyId}`);
  }

  addCompany(data: any) {
    return this.http.post(`${ROOT_API}/companies`, data);
  }

  updateCompany(companyId: string, data: any) {
    return this.http.put(`${ROOT_API}/companies/${companyId}`, data);
  }

  delete(companyId: string) {
    return this.http.delete(`${ROOT_API}/companies/${companyId}`);
  }

  assignCompanyToBranch(companyId: string, data: any) {
    return this.http.put(`${ROOT_API}/companies/${companyId}/assign`, data);
  }

  getProvinces(param: string) {
    return this.http.get(`${ROOT_API}/provinces?${param}`);
  }
  getCities(provinceId: string) {
    return this.http.get(
      `${ROOT_API}/cities?with_filter=1&province_id=${provinceId}&limit=1000`,
    );
  }
  getSubdistricts(cityId: string) {
    return this.http.get(
      `${ROOT_API}/subdistricts?with_filter=1&city_id=${cityId}&limit=1000`,
    );
  }
}
