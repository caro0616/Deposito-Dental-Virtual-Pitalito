import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

export interface OdontoBotMessage {
  from: 'user' | 'bot';
  text: string;
  actions?: OdontoBotAction[];
}

export interface OdontoBotAction {
  label: string;
  type: 'add-to-cart' | 'checkout' | 'more-info' | 'compare' | 'none';
  payload?: any;
}

@Injectable({ providedIn: 'root' })
export class OdontoBotService {
  private http = inject(HttpClient);
  // Puedes ajustar la URL base según tu backend
  private apiUrl = '/api';

  // Estado conversacional
  private context: any = {};

  constructor() {}

  // Procesa el mensaje del usuario y responde
  processMessage(message: string): Observable<OdontoBotMessage[]> {
    // 1. Detectar si el mensaje es relevante (tema dental)
    if (!this.isDentalTopic(message)) {
      return of([{ from: 'bot', text: 'Solo puedo ayudarte con productos, recomendaciones y dudas del área odontológica. ¿Sobre qué producto o necesidad dental quieres consultar?' }]);
    }
    // 2. Detectar intención
    const intent = this.detectIntent(message);
    switch (intent) {
      case 'recommend':
        return this.recommendProducts(message);
      case 'features':
        return this.productFeatures(message);
      case 'compare':
        return this.compareProducts(message);
      case 'add-to-cart':
        return this.addToCart(message);
      case 'checkout':
        return this.checkout();
      default:
        return of([{ from: 'bot', text: '¿Puedes darme más detalles sobre lo que necesitas? Puedo recomendarte productos, comparar opciones o ayudarte a comprar.' }]);
    }
  }

  // --- Intención y lógica básica ---
  private isDentalTopic(msg: string): boolean {
    // Mejorado: busca palabras clave odontológicas y productos comunes
    return /dental|diente|boca|instrument|material|caries|bracket|resina|adhesivo|limpieza|extracci|cemento|endodon|ah plus|dentsply|gutta|canal|obturaci|sellador|composite|amalgama|esmalte|periodontal|ortodoncia|protesis|corona|puente|implante|alginato|impresion|clorhexidina|irrigador|cavitron|curet|espejo|explorador|pinza|turbina|micromotor|fresa|jeringa|algodonera|bisturi|eugenol|ionomero|fosfato|zinc|glass/i.test(msg);
  }

  private detectIntent(msg: string): string {
    msg = msg.toLowerCase();
    if (/recomienda|sugerencia|qué producto|mejor para|busco|necesito/.test(msg)) return 'recommend';
    if (/característica|uso|para qué sirve|cómo se usa|detalle/.test(msg)) return 'features';
    if (/compara|diferencia entre|vs\b/.test(msg)) return 'compare';
    if (/agrega|añade|quiero comprar|pon en el carrito|llevar/.test(msg)) return 'add-to-cart';
    if (/pagar|checkout|finalizar|proceder/.test(msg)) return 'checkout';
    return 'unknown';
  }

  // --- Lógica de negocio simulada (conexión real después) ---
  private recommendProducts(msg: string): Observable<OdontoBotMessage[]> {
    // Aquí deberías llamar a tu API real de productos con filtros
    // Simulación:
    return of([
      { from: 'bot', text: 'Te recomiendo la Resina Filtek Z350 para restauraciones estéticas. ¿Te gustaría saber más o agregarla al carrito?', actions: [
        { label: 'Más info', type: 'more-info', payload: { product: 'Resina Filtek Z350' } },
        { label: 'Agregar al carrito', type: 'add-to-cart', payload: { product: 'Resina Filtek Z350' } }
      ] }
    ]);
  }

  private productFeatures(msg: string): Observable<OdontoBotMessage[]> {
    // Simulación:
    return of([
      { from: 'bot', text: 'La Resina Filtek Z350 es ideal para restauraciones anteriores y posteriores. Ofrece alta resistencia y excelente estética.' }
    ]);
  }

  private compareProducts(msg: string): Observable<OdontoBotMessage[]> {
    // Simulación:
    return of([
      { from: 'bot', text: 'La Resina Filtek Z350 tiene mejor estética, mientras que la Tetric EvoCeram es más económica. ¿Te gustaría una recomendación personalizada?' }
    ]);
  }

  private addToCart(msg: string): Observable<OdontoBotMessage[]> {
    // Aquí deberías llamar a tu API real de carrito
    return of([
      { from: 'bot', text: '¿Cuántas unidades deseas agregar al carrito?' }
    ]);
  }

  private checkout(): Observable<OdontoBotMessage[]> {
    // Aquí podrías redirigir al checkout
    return of([
      { from: 'bot', text: 'Perfecto, te llevo al checkout para finalizar tu compra.', actions: [
        { label: 'Ir a checkout', type: 'checkout' }
      ] }
    ]);
  }
}
