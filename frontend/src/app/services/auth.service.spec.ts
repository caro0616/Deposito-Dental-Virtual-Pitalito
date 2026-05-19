import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;

  function createToken(payload: Record<string, unknown>): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    const body = btoa(JSON.stringify(payload))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    return `${header}.${body}.sig`;
  }

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('register/login/loginWithGoogle persist token and user', async () => {
    const payload = {
      sub: 'u1',
      email: 'test@test.com',
      role: 'customer',
      provider: 'local',
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
    const token = createToken(payload);

    const registerPromise = service.register('User', 'test@test.com', 'secret');
    const registerReq = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
    registerReq.flush({ token });
    await registerPromise;
    expect(service.isLoggedIn()).toBeTrue();
    expect(service.userId()).toBe('u1');

    const loginPromise = service.login('test@test.com', 'secret');
    const loginReq = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    loginReq.flush({ token });
    await loginPromise;

    const googlePromise = service.loginWithGoogle('cred');
    const googleReq = httpMock.expectOne(`${environment.apiUrl}/auth/google`);
    googleReq.flush({ token });
    await googlePromise;

    expect(localStorage.getItem('auth_token')).toBe(token);
    expect(localStorage.getItem('user_id')).toBe('u1');
  });

  it('verifySession true sets user; false clears session on error', async () => {
    localStorage.setItem('auth_token', createToken({
      sub: 'u2',
      email: 'u2@test.com',
      role: 'customer',
      provider: 'local',
      exp: Math.floor(Date.now() / 1000) + 3600,
    }));

    const okPromise = service.verifySession();
    const okReq = httpMock.expectOne(`${environment.apiUrl}/auth/me`);
    okReq.flush({ sub: 'u2', email: 'u2@test.com', role: 'admin', provider: 'local' });
    expect(await okPromise).toBeTrue();
    expect(service.isAdmin()).toBeTrue();

    localStorage.setItem('auth_token', createToken({
      sub: 'u3',
      email: 'u3@test.com',
      role: 'customer',
      provider: 'local',
      exp: Math.floor(Date.now() / 1000) + 3600,
    }));

    const failPromise = service.verifySession();
    const failReq = httpMock.expectOne(`${environment.apiUrl}/auth/me`);
    failReq.flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(await failPromise).toBeFalse();
    expect(service.getToken()).toBeNull();
    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  it('logout clears state and navigates home', () => {
    localStorage.setItem('auth_token', createToken({
      sub: 'u1',
      email: 'u1@test.com',
      role: 'customer',
      provider: 'local',
      exp: Math.floor(Date.now() / 1000) + 3600,
    }));

    service.logout();

    expect(service.isLoggedIn()).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('constructor restoreSession clears invalid or expired tokens', () => {
    localStorage.setItem('auth_token', 'bad.token');
    const invalidService = TestBed.inject(AuthService);
    expect(invalidService.getToken()).toBeNull();

    localStorage.setItem(
      'auth_token',
      createToken({
        sub: 'u9',
        email: 'u9@test.com',
        role: 'customer',
        provider: 'local',
        exp: Math.floor(Date.now() / 1000) - 10,
      }),
    );
    const expiredService = TestBed.inject(AuthService);
    expect(expiredService.getToken()).toBeNull();
  });

  it('private decodeToken returns null for malformed tokens', () => {
    const decodedShort = (service as never as { decodeToken: (t: string) => unknown }).decodeToken(
      'abc.def',
    );
    expect(decodedShort).toBeNull();

    const decodedInvalid = (
      service as never as { decodeToken: (t: string) => unknown }
    ).decodeToken('abc.def.ghi');
    expect(decodedInvalid).toBeNull();
  });

  it('private handleAuthResponse throws when token payload is invalid', () => {
    const call = () =>
      (
        service as never as {
          handleAuthResponse: (res: { token: string }) => void;
        }
      ).handleAuthResponse({ token: 'invalid.token.structure' });

    expect(call).toThrow();
  });

  it('private restoreSession keeps valid token active', () => {
    const token = createToken({
      sub: 'u-valid',
      email: 'valid@test.com',
      role: 'customer',
      provider: 'local',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    localStorage.setItem('auth_token', token);

    (
      service as never as {
        restoreSession: () => void;
      }
    ).restoreSession();

    expect(service.getToken()).toBe(token);
    expect(service.userId()).toBe('u-valid');
  });
});
