import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { DataListParameter } from '../../../shared/interfaces/data-list-parameter.interface';

const ROOT_API = environment.API_URL;

@Injectable({
  providedIn: 'root',
})
export class StaffService {
  constructor(private http: HttpClient) {}

  getStaffs(dataListParameter: DataListParameter = {} as DataListParameter) {
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
    if (dataListParameter.get_teacher) {
      param = param.concat(`&get_teacher=${dataListParameter.get_teacher}`);
    }

    if (dataListParameter.searchQuery) {
      if (!dataListParameter.sortBy) {
        param = param.concat('?q=' + dataListParameter.searchQuery);
      } else {
        param = param.concat('&q=' + dataListParameter.searchQuery);
      }
    }
    return this.http.get(`${ROOT_API}/admin/staff/${param}`);
  }

  getStaff(id: string) {
    return this.http.get(`${ROOT_API}/admin/staff/${id}`);
  }

  updateStaffBasedOnUser(userId: string, bodyReq: any) {
    return this.http.put(`${ROOT_API}/admin/users/${userId}`, bodyReq);
  }

  deleteUser(id: string) {
    return this.http.delete(`${ROOT_API}/admin/users/${id}`);
  }

  updateProfilePicture(id: string, user: any) {
    return this.http.post(
      `${ROOT_API}/admin/users/${id}/profile-picture`,
      user,
    );
  }

  assignBusinessUnit(data: any, staffId: string) {
    return this.http.put(
      `${ROOT_API}/admin/users/staff/${staffId}/assign`,
      data,
    );
  }

  deleteBusinessUnit(businessUnitId: number, staffId: string) {
    return this.http.delete(`${ROOT_API}/admin/users/staff/${staffId}/remove`, {
      body: {
        business_units: [
          {
            id: businessUnitId,
          },
        ],
      },
    });
  }
}
