import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { CardBrand, CheckoutPayload, CustomerDocumentType, PaymentMethod } from '../../models/product.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent implements OnInit {
  private fb = inject(FormBuilder);
  readonly cartService = inject(CartService);
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly submitting = signal(false);
  readonly submitError = signal('');
  readonly submitSuccess = signal('');
  readonly paymentMethod = signal<PaymentMethod>('pse');
  readonly cardBrands: CardBrand[] = ['visa', 'mastercard', 'amex'];
  readonly documentTypes: { value: CustomerDocumentType; label: string }[] = [
    { value: 'cc', label: 'Cédula de ciudadanía' },
    { value: 'ce', label: 'Cédula de extranjería' },
    { value: 'nit', label: 'NIT' },
    { value: 'passport', label: 'Pasaporte' },
  ];

  readonly total = computed(() => this.cartService.total());

  readonly form = this.fb.group({
    customer: this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.minLength(7)]],
      documentType: this.fb.nonNullable.control<CustomerDocumentType>('cc', Validators.required),
      documentNumber: ['', [Validators.required, Validators.minLength(5)]],
    }),
    shipping: this.fb.group({
      department: ['', [Validators.required, Validators.minLength(2)]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      addressLine1: ['', [Validators.required, Validators.minLength(5)]],
      addressLine2: [''],
      reference: [''],
    }),
    payment: this.fb.group({
      method: this.fb.nonNullable.control<PaymentMethod>('pse', Validators.required),
      cardBrand: this.fb.control<CardBrand | null>(null),
    }),
  });

  async ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      await this.router.navigate(['/auth']);
      return;
    }

    await this.cartService.loadCart();
    if (this.cartService.items().length === 0) {
      await this.router.navigate(['/carrito']);
      return;
    }

    this.form.controls.payment.controls.method.valueChanges.subscribe((method) => {
      this.paymentMethod.set(method);
      const brandControl = this.form.controls.payment.controls.cardBrand;
      if (method === 'card') {
        brandControl.setValidators([Validators.required]);
      } else {
        brandControl.clearValidators();
        brandControl.setValue(null);
      }
      brandControl.updateValueAndValidity();
    });
  }

  async submitOrder() {
    this.form.markAllAsTouched();
    this.submitError.set('');
    this.submitSuccess.set('');

    if (this.form.invalid) {
      this.submitError.set('Completa los datos del comprador, entrega y pago antes de continuar.');
      return;
    }

    const payload = this.form.getRawValue() as CheckoutPayload;
    this.submitting.set(true);
    try {
      await this.orderService.checkout(payload);
      this.cartService.clearLocal();
      await this.cartService.loadCart();
      this.submitSuccess.set('Pedido creado correctamente.');
      await this.router.navigate(['/carrito']);
    } catch (err: any) {
      this.submitError.set(err?.error?.message || 'No se pudo completar el checkout.');
    } finally {
      this.submitting.set(false);
    }
  }
}