import { Action } from '@ngrx/store';
import { PageableResults, Paging } from 'src/app/api/types/Pageable';
import { Tenant, Tenants } from '../platform';
import { User } from 'src/app/stores/stores';

export enum PlatformActionType {
  InitializeState = '[platform] InitializeState',
  LoadTenants = '[platform] LoadTenants',
  LoadTenantsSuccess = '[platform] LoadTenantsSuccess',
  LoadTenantsFailed = '[platform] LoadTenantsFailed',
  CreateTenant = '[platform] CreateTenant',
  CreateTenantSuccess = '[platform] CreateTenantSuccess',
  CreateTenantFailed = '[platform] CreateTenantFailed',
  LoadSelectedTenant = '[platform] LoadSelectedTenant',
  LoadSelectedTenantSuccess = '[platform] LoadSelectedTenantSuccess',
  LoadSelectedTenantFailed = '[platform] LoadSelectedTenantFailed',
  UpdateTenant = '[platform] UpdateTenant',
  UpdateTenantSuccess = '[Platform] UpdateTenantSuccess',
  UpdateTenantFailed = '[Platform] UpdateTenantFailed',
  DownloadTenantLogo = '[platform] DownloadTenantLogo',
  DownloadTenantLogoSuccess = '[platform] DownloadTenantLogoSuccess',
  DownloadTenantLogoFailed = '[platform] DownloadTenantLogoFailed',
  InviteTenantUser = '[platform] InviteTenantUser',
  InviteTenantUserSuccess = '[platform] InviteTenantUserSuccess',
  InviteTenantUserFailed = '[platform] InviteTenantUserFailed',
  LoadTenantUsers = '[platform] LoadTenantUsers',
  LoadTenantUsersSuccess = '[platform] LoadTenantUsersSuccess',
  LoadTenantUsersFailed = '[platform] LoadTenantUsersFailed',
  RevokeTenantUserAccess = '[platform] RevokeTenantUserAccess',
  RevokeTenantUserAccessSuccess = '[platform] RevokeTenantUserAccessSuccess ',
  RevokeTenantUserAccessFailed = '[platform] RevokeTenantUserAccessFailed',
  DeleteTanentLogo = '[platform] DeleteTanentLogo',
  DeleteTanentLogoSuccess = '[platform] DeleteTanentLogoSuccess',
  DeleteTanentLogoFailed = '[platform] DeleteTanentLogoFailed'
}

export class InitializeState implements Action {
  readonly type = PlatformActionType.InitializeState;
  constructor() { }
}

export class LoadTenants implements Action {
  readonly type = PlatformActionType.LoadTenants;
  constructor(public readonly paging: Paging) { }
}

export class LoadTenantsSuccess implements Action {
  readonly type = PlatformActionType.LoadTenantsSuccess;
  constructor(public readonly tenants: PageableResults<Tenants>) { }
}

export class LoadTenantsFailed implements Action {
  readonly type = PlatformActionType.LoadTenantsFailed;
  constructor(public readonly error: string) { }
}

export class CreateTenant implements Action {
  readonly type = PlatformActionType.CreateTenant;
  constructor(public readonly tenant: Tenant) { }
}

export class CreateTenantSuccess implements Action {
  readonly type = PlatformActionType.CreateTenantSuccess;
  constructor() { }
}

export class CreateTenantFailed implements Action {
  readonly type = PlatformActionType.CreateTenantFailed;
  constructor(public readonly error: string) { }
}

export class LoadSelectedTenant implements Action {
  readonly type = PlatformActionType.LoadSelectedTenant;
  constructor(public readonly tenantCode: string) { }
}

export class LoadSelectedTenantSuccess implements Action {
  readonly type = PlatformActionType.LoadSelectedTenantSuccess;
  constructor(public readonly tenant: Tenant) { }
}

export class LoadSelectedTenantFailed implements Action {
  readonly type = PlatformActionType.LoadSelectedTenantFailed;
  constructor(public readonly error: string) { }
}

export class UpdateTenant implements Action {
  readonly type = PlatformActionType.UpdateTenant;
  constructor(public readonly tenantCode: string, public readonly tenant: Tenant, public readonly file: File) { }
}

export class UpdateTenantSuccess implements Action {
  readonly type = PlatformActionType.UpdateTenantSuccess;
  constructor() { }
}

export class UpdateTenantFailed implements Action {
  readonly type = PlatformActionType.UpdateTenantFailed;
  constructor(public readonly error: string) { }
}

export class DownloadTenantLogo implements Action {
  readonly type = PlatformActionType.DownloadTenantLogo;

  constructor(public readonly url: string) { }

}

export class DownloadTenantLogoSuccess implements Action {
  readonly type = PlatformActionType.DownloadTenantLogoSuccess;

  constructor(public readonly blob: Blob, public readonly filename: string) { }

}

export class DownloadTenantLogoFailed implements Action {
  readonly type = PlatformActionType.DownloadTenantLogoFailed;

  constructor(public readonly error: string) { }

}

export class InviteTenantUser implements Action {
  readonly type = PlatformActionType.InviteTenantUser;
  constructor(public readonly email: string, public readonly tenantCode: string){}
}

export class InviteTenantUserSuccess implements Action {
  readonly type = PlatformActionType.InviteTenantUserSuccess;
  constructor(){}
}
export class InviteTenantUserFailed implements Action {
  readonly type = PlatformActionType.InviteTenantUserFailed;
  constructor(){}
}

export class LoadTenantUsers implements Action {
  readonly type = PlatformActionType.LoadTenantUsers;
  constructor(public readonly tenantCode: string){}
}

export class LoadTenantUsersSuccess implements Action {
  readonly type = PlatformActionType.LoadTenantUsersSuccess;
  constructor(public readonly users: User[]){}
}

export class LoadTenantUsersFailed implements Action {
  readonly type = PlatformActionType.LoadTenantUsersFailed;
  constructor(public readonly error: string){}
}

export class RevokeTenantUserAccess implements Action {
  readonly type = PlatformActionType.RevokeTenantUserAccess;
  constructor(public readonly userId: number, public readonly tenantCode: string) { }
}

export class RevokeTenantUserAccessSuccess implements Action {
  readonly type = PlatformActionType.RevokeTenantUserAccessSuccess;
  constructor(public readonly userId: number, public readonly tenantCode: string) { }
}

export class RevokeTenantUserAccessFailed implements Action {
  readonly type = PlatformActionType.RevokeTenantUserAccessFailed;
  constructor() { }
}

export class DeleteTanentLogo implements Action {
  readonly type = PlatformActionType.DeleteTanentLogo;
  constructor(public readonly tenantCode: string) { }
}

export class DeleteTanentLogoSuccess implements Action {
  readonly type = PlatformActionType.DeleteTanentLogoSuccess;
  constructor() { }
}

export class DeleteTanentLogoFailed implements Action {
  readonly type = PlatformActionType.DeleteTanentLogoFailed;
  constructor() { }
}


export type PlatformAction =
  InitializeState
  | LoadTenants
  | LoadTenantsSuccess
  | LoadTenantsFailed
  | CreateTenant
  | CreateTenantSuccess
  | CreateTenantFailed
  | LoadSelectedTenant
  | LoadSelectedTenantSuccess
  | LoadSelectedTenantFailed
  | UpdateTenant
  | UpdateTenantSuccess
  | UpdateTenantFailed
  | DownloadTenantLogo
  | DownloadTenantLogoSuccess
  | DownloadTenantLogoFailed
  | InviteTenantUser
  | InviteTenantUserSuccess
  | InviteTenantUserFailed
  | LoadTenantUsers
  | LoadTenantUsersSuccess
  | LoadTenantUsersFailed
  | RevokeTenantUserAccess
  | RevokeTenantUserAccessSuccess
  | RevokeTenantUserAccessFailed
  | DeleteTanentLogo
  | DeleteTanentLogoSuccess
  | DeleteTanentLogoFailed