import { Tenant } from "src/app/store-platform/platform";

export interface PageableResults<T> {
    allTenants?: Tenant[];
    data: T[];
    allUsers: T;
    totalPages: number;
    totalElements: number;
    pageNumber: number;
    pageSize: number;
    offset: number;
}

export interface Paging {
  page: number;
  size: number;
}

export const defaultPaging: Paging = {
    page: 0,
    size: -1
};
