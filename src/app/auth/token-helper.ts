import { HttpRequest } from '@angular/common/http';

const authEndpoint = /api\/v1\/auth/gi;

const authEndpoints = [
  '/api/v1/auth/logout',
  '/api/v1/auth/profile',
  '/api/v1/auth/profile/password/update',
  '/api/v1/auth/profile/password/create',
  '/api/v1/auth/profile/social/google/link',
  '/api/v1/auth/profile/social/facebook/link',
  '/api/v1/auth/currentuser',
];

export function isNonAuthEndpoint(request: HttpRequest<any>) {
  return authEndpoints.includes(request.url) || request.url.search(authEndpoint) === -1;
}

export function addToken(request: HttpRequest<any>, token: string) {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}
