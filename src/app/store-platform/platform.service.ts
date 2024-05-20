import { HttpClient, HttpHeaders, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Tenant, TenantLogoResponse, Tenants } from "./platform";
import { Observable } from "rxjs";
import { PageableResults, defaultPaging } from "../api/types/Pageable";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class PlatformService {
  constructor(private http: HttpClient) { }
  createTenant(request: Tenant): Observable<Tenant> {
    return this.http.post<Tenant>('/api/v1/tenant', request);
  }

  getTenants(paging = defaultPaging): Observable<PageableResults<Tenants>> {
    return this.http.get<PageableResults<Tenants>>(`/api/v1/tenants?page=${paging.page}&size=${paging.size}`);
  }

  getSelectedTenant(tenantCode: string): Observable<Tenant> {
    return this.http.get<Tenant>(`/api/v1/tenant/${tenantCode}`);
  }

  updateTenant(tenantCode:string, request: Tenant, file: File ): Observable<Tenant> {
    const formData = new FormData();
    if(file){
      formData.append('file', file);
    }
    formData.append('request', JSON.stringify(request));
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'multipart/form-data');
    return this.http.patch<Tenant>(`/api/v1/tenant/${tenantCode}`, formData,  { headers: headers });
  }

  downloadTenantLogo(url: string): Observable<TenantLogoResponse> {
    return this.http.get(url, {
      observe: 'response',
      responseType: 'blob'
    }).pipe(
      map(r => this.toTenantLogoResponse(r))
    );
  }

  private toTenantLogoResponse(response: HttpResponse<Blob>): TenantLogoResponse {
    const blob = response.body;
    const filename = response.url.split('/').pop().split('?')[0];
    return { blob, filename };
  }

  inviteTenantUser(email: string, tenantCode: string): Observable<{}> {
    const request = {
      email
    };
    return this.http.post<{}>(`/api/v1/tenant/${tenantCode}/invite`, request);
  }

  getTenantUsers(tenantCode: string): Observable<{ data: []}> {
    return this.http.get<{data: []}>(`/api/v1/tenant/${tenantCode}/users`);
  }
 
  removeTenantUserAccess(userId, tenantCode): Observable<void> {
    return this.http.delete<void>(`/api/v1/tenant/${tenantCode}/user/${userId}`);
  }

  deleteLogo(tenantCode: string): Observable<void> {
    return this.http.delete<void>(`/api/v1/tenant/${tenantCode}/delete-logo`);
  }

}