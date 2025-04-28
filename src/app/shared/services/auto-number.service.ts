import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DataListParameter } from '../interfaces/data-list-parameter.interface';

const ROOT_API = environment.API_URL;

@Injectable({
  providedIn: 'root',
})
export class AutoNumberService {
  constructor(private http: HttpClient) {}

  getAutoNumbers(
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
      param = param.concat(
        '&' + dataListParameter.filterObj + '&with_filter=1',
      );
    }

    if (dataListParameter.searchQuery) {
      if (!dataListParameter.sortBy) {
        param = param.concat('?q=' + dataListParameter.searchQuery);
      } else {
        param = param.concat('&q=' + dataListParameter.searchQuery);
      }
    }
    return this.http.get(`${ROOT_API}/admin/auto-numbers${param}`);
  }
  getAutoNumberByTabel(table: string) {
    return this.http
      .get(`${ROOT_API}/admin/auto-numbers?with_filter=1&table=${table}`)
      .pipe(
        map((res: any) => {
          return res.data.auto_numbers[0];
        }),
      );
  }
}
