import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NotificationService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(NotificationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('fetchAll prepends default DentiBot notification when missing', () => {
    service.fetchAll();

    const req = httpMock.expectOne('/api/notifications');
    expect(req.request.method).toBe('GET');
    req.flush([
      {
        _id: 'n1',
        title: 'Noticia',
        message: 'Nueva promo',
        createdAt: new Date().toISOString(),
      },
    ]);

    const list = service.notifications();
    expect(list[0]?.url).toBe('/chatbot');
    expect(list.length).toBe(2);
    expect(service.unreadCount()).toBe(2);
  });

  it('createNews posts data and updates signal list', async () => {
    const promise = service.createNews('Titulo', 'Mensaje', '/catalogo');

    const req = httpMock.expectOne('/api/notifications');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.title).toBe('Titulo');
    expect(req.request.body.message).toBe('Mensaje');
    req.flush({
      _id: 'n2',
      title: 'Titulo',
      message: 'Mensaje',
      url: '/catalogo',
      createdAt: new Date().toISOString(),
    });

    const created = await promise;
    expect(created._id).toBe('n2');
    expect(service.notifications()[0]?._id).toBe('n2');
    expect(service.notifications()[0]?.read).toBeFalse();
  });

  it('markAsRead and remove update notifications state', () => {
    service.notifications.set([
      {
        _id: 'n1',
        title: 'A',
        message: 'B',
        createdAt: new Date().toISOString(),
        read: false,
      },
      {
        _id: 'n2',
        title: 'C',
        message: 'D',
        createdAt: new Date().toISOString(),
        read: false,
      },
    ]);

    service.markAsRead('n1');
    expect(service.notifications().find((n) => n._id === 'n1')?.read).toBeTrue();

    service.remove('n2');
    expect(service.notifications().map((n) => n._id)).toEqual(['n1']);
  });
});
