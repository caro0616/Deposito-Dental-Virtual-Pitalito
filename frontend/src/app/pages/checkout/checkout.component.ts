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

  readonly pseBanks = [
    'Bancolombia',
    'Banco de Bogotá',
    'Davivienda',
    'BBVA Colombia',
    'Banco de Occidente',
    'Banco Popular',
    'AV Villas',
    'Banco Caja Social',
    'Nequi',
    'Banco Falabella',
  ];

  readonly expiryMonths = ['01','02','03','04','05','06','07','08','09','10','11','12'];
  readonly expiryYears = Array.from({ length: 10 }, (_, i) => String(new Date().getFullYear() + i));

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
      // PSE simulation fields
      pseBank: ['', Validators.required],
      pseAccountHolder: ['', [Validators.required, Validators.minLength(3)]],
      // Card simulation fields
      cardNumber: [''],
      nameOnCard: [''],
      expiryMonth: [''],
      expiryYear: [''],
      cvv: [''],
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
      this.resetPaymentSimulationFields();
      this.applyPaymentValidators(method);
    });
  }

  formatCardNumber(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 16);
    const formatted = digits.replace(/(.{4})/g, '$1 ').trim();
    input.value = formatted;
    this.form.controls.payment.controls.cardNumber.setValue(formatted, { emitEvent: false });
  }

  async submitOrder() {
    this.form.markAllAsTouched();
    this.submitError.set('');
    this.submitSuccess.set('');

    if (this.form.invalid) {
      this.submitError.set('Completa todos los datos requeridos antes de continuar.');
      return;
    }

    const raw = this.form.getRawValue();
    const payload: CheckoutPayload = {
      customer: raw.customer as CheckoutPayload['customer'],
      shipping: raw.shipping as CheckoutPayload['shipping'],
      payment: {
        method: raw.payment.method,
        ...(raw.payment.cardBrand ? { cardBrand: raw.payment.cardBrand as CardBrand } : {}),
      },
    };

    this.submitting.set(true);
    try {
      await this.orderService.checkout(payload);
      this.cartService.clearLocal();
      await this.cartService.loadCart();
      this.submitSuccess.set('Pago procesado y pedido creado correctamente. Redirigiendo...');
      await this.router.navigate(['/orders']);
    } catch (err: unknown) {
      let msg = 'No se pudo completar el checkout.';
      if (typeof err === 'object' && err !== null) {
        const e = err as Record<string, unknown>;
        if ('error' in e && typeof e['error'] === 'object' && e['error'] !== null && 'message' in (e['error'] as Record<string, unknown>)) {
          msg = ((e['error'] as Record<string, unknown>)['message'] as string);
        } else if ('message' in e) {
          msg = e['message'] as string;
        }
      }
      this.submitError.set(msg);
    } finally {
      this.submitting.set(false);
    }
  }

  private resetPaymentSimulationFields(): void {
    const p = this.form.controls.payment.controls;
    p.cardBrand.setValue(null);
    p.pseBank.setValue('');
    p.pseAccountHolder.setValue('');
    p.cardNumber.setValue('');
    p.nameOnCard.setValue('');
    p.expiryMonth.setValue('');
    p.expiryYear.setValue('');
    p.cvv.setValue('');
    [p.cardBrand, p.pseBank, p.pseAccountHolder, p.cardNumber, p.nameOnCard, p.expiryMonth, p.expiryYear, p.cvv]
      .forEach(c => c.clearValidators());
  }

  private applyPaymentValidators(method: PaymentMethod): void {
    const p = this.form.controls.payment.controls;
    if (method === 'card') {
      p.cardBrand.setValidators([Validators.required]);
      p.cardNumber.setValidators([Validators.required, Validators.minLength(19)]);
      p.nameOnCard.setValidators([Validators.required, Validators.minLength(3)]);
      p.expiryMonth.setValidators([Validators.required]);
      p.expiryYear.setValidators([Validators.required]);
      p.cvv.setValidators([Validators.required, Validators.minLength(3), Validators.maxLength(4)]);
    } else {
      p.pseBank.setValidators([Validators.required]);
      p.pseAccountHolder.setValidators([Validators.required, Validators.minLength(3)]);
    }
    [p.cardBrand, p.pseBank, p.pseAccountHolder, p.cardNumber, p.nameOnCard, p.expiryMonth, p.expiryYear, p.cvv]
      .forEach(c => c.updateValueAndValidity());
  }
}
