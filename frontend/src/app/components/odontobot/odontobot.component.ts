import { Component, signal, effect, inject, ElementRef, ViewChild, AfterViewChecked, OnInit } from '@angular/core';
import { odontobotOpenSignal } from '../../services/odontobot.service';
import { AuthService } from '../../services/auth.service';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ChatOption {
  label: string;
  value: string;
}

interface ChatMessage {
  from: 'bot' | 'user';
  text: string;
  options?: ChatOption[];
  file?: File;
}


@Component({
  selector: 'app-odontobot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './odontobot.component.html',
  styleUrls: ['./odontobot.component.scss']
})
export class OdontobotComponent implements AfterViewChecked, OnInit {
  auth = inject(AuthService);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private router = inject(Router);

  @ViewChild('scrollMe') private scrollContainer!: ElementRef;

  open = odontobotOpenSignal;
  messages = signal<ChatMessage[]>([]);
  input = signal('');
  typing = signal(false);
  selectedFile = signal<File | null>(null);
  fileError = signal('');

  readonly allowedFileMimeTypes = ['image/png', 'image/jpeg', 'application/pdf'];
  readonly allowedFileExtensions = ['png', 'jpg', 'jpeg', 'pdf'];

  awaiting:
    | null
    | 'main'
    | 'asesoria-query'
    | 'recomendacion'
    | 'known-product-query'
    | 'need-query'
    | 'ask-quantity' = null;

  private selectedProduct: Product | null = null;
  private lastSuggestions: Product[] = [];

  private quickCategoryOptions: ChatOption[] = [
    { label: 'Instrumental', value: 'category:instrumental' },
    { label: 'Materiales', value: 'category:materiales' },
    { label: 'Endodoncia', value: 'category:consumibles' },
    { label: 'Bioseguridad', value: 'category:proteccion' },
  ];

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom() {
    if (this.scrollContainer?.nativeElement) {
      const el = this.scrollContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }

  toggle() {
    this.open.update(v => !v);
    if (this.open() && this.messages().length === 0) {
      this.startConversation();
    }
  }

  ngOnInit() {
    effect(() => {
      if (!this.auth.user()) {
        this.messages.set([]);
        this.input.set('');
        this.open.set(false);
      }
      // Si alguien dispara odontobotOpenSignal a true, abrir el chat
      if (odontobotOpenSignal()) {
        if (!this.open()) {
          this.open.set(true);
          if (this.messages().length === 0) this.startConversation();
        }
      }
    });
  }

  startConversation() {
    this.messages.set([
      { from: 'bot', text: '¡Hola! Soy OdontoBot 👋' },
      {
        from: 'bot',
        text: '¿En qué puedo ayudarte hoy?',
        options: [
          { label: 'Asesoría', value: 'main:asesoria' },
          { label: 'Recomendación', value: 'main:recomendacion' },
        ]
      }
    ]);

    this.awaiting = 'main';
    this.selectedProduct = null;
    this.lastSuggestions = [];
  }

  async sendMessage() {
    if (!this.auth.isLoggedIn()) return;
    const value = this.input().trim();
    const attachedFile = this.selectedFile();
    if (!value && !this.selectedFile()) return;

    if (value) {
      this.messages.update(msgs => [
        ...msgs,
        { from: 'user', text: value }
      ]);
    }

    if (attachedFile) {
      this.messages.update(msgs => [
        ...msgs,
        { from: 'user', text: `Archivo: ${attachedFile.name}`, file: attachedFile }
      ]);
      this.selectedFile.set(null);
      this.fileError.set('');
    }

    this.input.set('');

    if (attachedFile) {
      await this.processAttachedFile(attachedFile);
    }

    if (value) {
      await this.handleUserInput(value);
    }
  }



  handleOption(option: ChatOption) {
    this.messages.update(msgs => [
      ...msgs,
      { from: 'user', text: option.label }
    ]);

    void this.handleOptionAction(option.value, option.label);
  }

  private async handleOptionAction(value: string, labelFallback = ''): Promise<void> {
    if (value.startsWith('main:')) {
      const main = value.split(':')[1];
      if (main === 'asesoria') {
        await this.pushBotMessage({
          from: 'bot',
          text: 'Perfecto. Cuéntame tu caso (procedimiento, tipo de paciente o producto que quieres evaluar) y te asesoro con opciones reales.'
        });
        this.awaiting = 'asesoria-query';
        return;
      }

      await this.pushBotMessage({
        from: 'bot',
        text: 'Genial. ¿Ya conoces el producto que necesitas?',
        options: [
          { label: 'Sí, ya lo tengo', value: 'reco:known' },
          { label: 'No, aún no', value: 'reco:unknown' },
        ]
      });
      this.awaiting = 'recomendacion';
      return;
    }

    if (value === 'reco:known') {
      await this.pushBotMessage({
        from: 'bot',
        text: 'Perfecto, escribe el nombre del producto o una parte (por ejemplo: "resina", "filtek", "adhesivo").'
      });
      this.awaiting = 'known-product-query';
      return;
    }

    if (value === 'reco:unknown') {
      await this.pushBotMessage({
        from: 'bot',
        text: 'Cuéntame qué necesitas resolver y te recomiendo opciones reales del catálogo.'
      });
      this.awaiting = 'need-query';
      return;
    }

    if (value.startsWith('search:')) {
      const query = value.split(':')[1] ?? labelFallback;
      await this.searchAndSuggestProducts(query);
      this.awaiting = 'need-query';
      return;
    }

    if (value.startsWith('category:')) {
      const category = value.split(':')[1] ?? '';
      await this.suggestProductsByCategory(category);
      this.awaiting = 'need-query';
      return;
    }

    if (value.startsWith('add:')) {
      const productId = value.split(':')[1];
      const product = this.lastSuggestions.find(p => p.id === productId);
      if (!product) {
        await this.pushBotMessage({
          from: 'bot',
          text: 'No encontré ese producto en el contexto actual. Te muestro opciones nuevamente.',
          options: this.quickCategoryOptions
        });
        return;
      }

      this.selectedProduct = product;
      this.awaiting = 'ask-quantity';
      await this.pushBotMessage({
        from: 'bot',
        text: `¿Cuántas unidades de ${product.name} deseas agregar al carrito?`
      });
      return;
    }

    if (value.startsWith('view:')) {
      const productId = value.split(':')[1];
      this.open.set(false);
      await this.router.navigate(['/producto', productId]);
      return;
    }

    if (value === 'go:cart') {
      this.open.set(false);
      await this.router.navigate(['/carrito']);
      return;
    }

    if (value === 'go:checkout') {
      this.open.set(false);
      await this.router.navigate(['/checkout']);
      return;
    }

    if (value === 'flow:restart') {
      this.startConversation();
      return;
    }
  }

  async handleUserInput(input: string) {
    const text = input.toLowerCase();
    if (!text.trim()) return;

    if (/checkout|finalizar|pagar/.test(text)) {
      this.open.set(false);
      await this.router.navigate(['/checkout']);
      return;
    }

    if (/carrito/.test(text)) {
      this.open.set(false);
      await this.router.navigate(['/carrito']);
      return;
    }

    if (this.awaiting === 'ask-quantity' && this.selectedProduct) {
      const qty = Number.parseInt(text, 10);
      if (!Number.isFinite(qty) || qty < 1) {
        await this.pushBotMessage({
          from: 'bot',
          text: 'Escribe una cantidad valida (por ejemplo 1, 2 o 3).'
        });
        return;
      }

      await this.addSelectedProductToCart(qty);
      return;
    }

    if (this.awaiting === 'main') {
      if (text.includes('asesor')) {
        await this.handleOptionAction('main:asesoria');
        return;
      }
      if (text.includes('recomend')) {
        await this.handleOptionAction('main:recomendacion');
        return;
      }

      await this.pushBotMessage({
        from: 'bot',
        text: 'Puedo ayudarte con asesoría o recomendación de productos reales.',
        options: [
          { label: 'Asesoría', value: 'main:asesoria' },
          { label: 'Recomendación', value: 'main:recomendacion' },
        ]
      });
      return;
    }

    if (this.awaiting === 'recomendacion') {
      if (text.includes('sí') || text.includes('si')) {
        await this.handleOptionAction('reco:known');
      } else {
        await this.handleOptionAction('reco:unknown');
      }
      return;
    }

    if (this.awaiting === 'asesoria-query' || this.awaiting === 'need-query' || this.awaiting === 'known-product-query') {
      await this.searchAndSuggestProducts(input);
      this.awaiting = 'need-query';
      return;
    }

    await this.searchAndSuggestProducts(input);
  }

  private async searchAndSuggestProducts(query: string): Promise<void> {
    const cleanQuery = query.trim();
    if (!cleanQuery) {
      await this.pushBotMessage({
        from: 'bot',
        text: 'Escribe un producto o necesidad para buscar en el catálogo.',
        options: this.quickCategoryOptions
      });
      return;
    }

    try {
      const normalized = this.normalizeQuery(cleanQuery);
      const categoryFromQuery = this.matchCategory(normalized);
      if (categoryFromQuery) {
        await this.suggestProductsByCategory(categoryFromQuery, cleanQuery);
        return;
      }

      const results = await this.productService.search(normalized);
      let available = results.filter(p => p.active && p.stock > 0).slice(0, 3);
      if (available.length === 0) {
        available = await this.fallbackLocalSearch(normalized);
      }

      this.lastSuggestions = available;

      if (available.length === 0) {
        await this.pushBotMessage({
          from: 'bot',
          text: `No encontré productos disponibles para "${cleanQuery}". Prueba con otra palabra o usa una categoría sugerida.`,
          options: this.quickCategoryOptions
        });
        return;
      }

      await this.pushSuggestionMessage(available);
    } catch {
      await this.pushBotMessage({
        from: 'bot',
        text: 'Tuve un problema al consultar el catálogo. Intenta de nuevo en un momento.'
      });
    }
  }

  private async suggestProductsByCategory(category: string, fromQuery?: string): Promise<void> {
    try {
      const results = await this.productService.getFilteredFromApi({
        category,
        available: true,
      });
      const available = results.filter(p => p.active && p.stock > 0).slice(0, 3);
      this.lastSuggestions = available;

      if (available.length === 0) {
        const label = fromQuery ?? category;
        await this.pushBotMessage({
          from: 'bot',
          text: `No encontré productos disponibles para "${label}". Prueba con otra categoría o necesidad más específica.`,
          options: this.quickCategoryOptions
        });
        return;
      }

      await this.pushSuggestionMessage(available);
    } catch {
      await this.pushBotMessage({
        from: 'bot',
        text: 'No pude consultar esa categoría en este momento. Intenta de nuevo.'
      });
    }
  }

  private async fallbackLocalSearch(query: string): Promise<Product[]> {
    const catalog = await this.productService.loadCatalog();
    const tokens = query.split(/\s+/).filter(Boolean);

    const scored = catalog
      .filter(p => p.active && p.stock > 0)
      .map((p) => {
        const haystack = this.normalizeQuery([
          p.name,
          p.description,
          p.brand,
          p.materials,
          p.category,
        ].join(' '));

        let score = 0;
        for (const token of tokens) {
          if (haystack.includes(token)) score += 2;
          if (p.name && this.normalizeQuery(p.name).includes(token)) score += 2;
          if (p.category && this.normalizeQuery(p.category).includes(token)) score += 1;
        }

        return { product: p, score };
      })
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(x => x.product);

    return scored;
  }

  private normalizeQuery(value: string): string {
    const normalized = value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    return normalized
      .replace(/anestecia/g, 'anestesia')
      .replace(/bioseguridad/g, 'proteccion')
      .replace(/endodoncia/g, 'consumibles')
      .replace(/resinas/g, 'resina')
      .trim();
  }

  private matchCategory(query: string): string | null {
    if (/(instrumental|pinza|espejo|explorador|fresa)/.test(query)) return 'instrumental';
    if (/(materiales|resina|adhesivo|cemento|ionomero|composite)/.test(query)) return 'materiales';
    if (/(endodoncia|consumibles|gutta|sellador|ah plus|canal)/.test(query)) return 'consumibles';
    if (/(bioseguridad|proteccion|nitrilo|guante|tapabocas)/.test(query)) return 'proteccion';
    if (/(equipo|equipos|turbina|micromotor|cavitron)/.test(query)) return 'equipos';
    return null;
  }

  private async pushSuggestionMessage(available: Product[]): Promise<void> {
    const lines = available
      .map((p, idx) => `${idx + 1}. ${p.name} (${this.formatPrice(p.price)}) - Stock: ${p.stock}`)
      .join('\n');

    const options: ChatOption[] = [];
    for (const p of available) {
      options.push({ label: `Agregar ${p.name}`, value: `add:${p.id}` });
    }
    options.push({ label: 'Ver carrito', value: 'go:cart' });
    options.push({ label: 'Ir a checkout', value: 'go:checkout' });

    await this.pushBotMessage({
      from: 'bot',
      text: `Encontré estas opciones reales:\n${lines}\n\nSi quieres, también puedo seguir recomendándote alternativas.`,
      options
    });
  }

  private async addSelectedProductToCart(quantity: number): Promise<void> {
    if (!this.selectedProduct) return;
    try {
      await this.cartService.add(this.selectedProduct.id, quantity);
      await this.cartService.loadCart();
      const name = this.selectedProduct.name;
      this.selectedProduct = null;
      this.awaiting = null;

      await this.pushBotMessage({
        from: 'bot',
        text: `Listo, agregué ${quantity} unidad(es) de ${name} al carrito. Ahora tienes ${this.cartService.count()} producto(s) en el carrito.`,
        options: [
          { label: 'Seguir comprando', value: 'flow:restart' },
          { label: 'Ver carrito', value: 'go:cart' },
          { label: 'Ir a checkout', value: 'go:checkout' },
        ]
      });
    } catch {
      await this.pushBotMessage({
        from: 'bot',
        text: 'No pude agregar el producto al carrito. Intenta nuevamente o verifica tu sesión.'
      });
    }
  }

  private async processAttachedFile(file: File): Promise<void> {
    await this.pushBotMessage({
      from: 'bot',
      text: 'Recibí tu archivo. Estoy analizando el contenido para identificar productos y materiales.'
    });

    try {
      const suggested = await this.productService.analyzeAttachment(file);
      if (suggested.length === 0) {
        await this.pushBotMessage({
          from: 'bot',
          text: 'Analicé el archivo, pero no encontré coincidencias claras en inventario. Si quieres, escribe 1 o 2 nombres clave y te ayudo a ubicarlos.'
        });
        return;
      }

      this.lastSuggestions = suggested;
      this.awaiting = 'need-query';
      await this.pushSuggestionMessage(suggested);
    } catch {
      await this.pushBotMessage({
        from: 'bot',
        text: 'Tuve un problema al analizar el archivo. Intenta de nuevo o comparte los nombres de productos por texto.'
      });
    }
  }

  private formatPrice(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(value);
  }

  private async pushBotMessage(message: ChatMessage): Promise<void> {
    this.typing.set(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    this.typing.set(false);
    this.messages.update(msgs => [...msgs, message]);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const resetInput = () => {
      input.value = '';
    };

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
      const isAllowedType = this.allowedFileMimeTypes.includes(file.type);
      const isAllowedExtension = this.allowedFileExtensions.includes(extension);

      if (!isAllowedType && !isAllowedExtension) {
        this.selectedFile.set(null);
        this.fileError.set('Solo puedes adjuntar archivos PNG, JPG/JPEG o PDF.');
        resetInput();
        return;
      }

      this.fileError.set('');
      this.selectedFile.set(file);
      return;
    }

    this.selectedFile.set(null);
    this.fileError.set('');
    resetInput();
  }
}