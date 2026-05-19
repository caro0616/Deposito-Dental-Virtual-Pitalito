import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductCardComponent } from './product-card.component';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { provideRouter } from '@angular/router';

describe('ProductCardComponent', () => {
  let fixture: ComponentFixture<ProductCardComponent>;
  let component: ProductCardComponent;
  let cartService: { add: jasmine.Spy };
  let authService: { isLoggedIn: jasmine.Spy };

  beforeEach(async () => {
    cartService = { add: jasmine.createSpy('add').and.resolveTo() };
    authService = { isLoggedIn: jasmine.createSpy('isLoggedIn').and.returnValue(true) };

    await TestBed.configureTestingModule({
      imports: [ProductCardComponent],
      providers: [
        provideRouter([]),
        { provide: ProductService, useValue: { toggleFavorite: jasmine.createSpy('toggleFavorite') } },
        { provide: CartService, useValue: cartService },
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductCardComponent);
    component = fixture.componentInstance;
    component.product = {
      id: 'p1',
      name: 'Resina',
      description: 'desc',
      price: 10000,
      imageUrl: '',
      category: 'materiales',
      stock: 10,
      active: true,
      sku: 'R1',
      brand: '3M',
      invima: '',
      materials: 'resina',
      dimensions: '',
    };
    fixture.detectChanges();
  });

  it('stockLabel is Agotado when stock is 0', () => {
    component.product.stock = 0;
    expect(component.stockLabel).toBe('Agotado');
  });

  it('addToCart does nothing when stock is 0', async () => {
    component.product.stock = 0;
    await component.addToCart(new MouseEvent('click'));
    expect(cartService.add).not.toHaveBeenCalled();
  });

  it('addToCart calls cart service when logged in and stock > 0', async () => {
    component.product.stock = 2;
    await component.addToCart(new MouseEvent('click'));
    expect(authService.isLoggedIn).toHaveBeenCalled();
    expect(cartService.add).toHaveBeenCalledWith('p1');
  });
});
