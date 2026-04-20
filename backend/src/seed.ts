/**
 * seed.ts — Poblar la base de datos con productos dentales reales.
 *
 * Uso:
 *   npx ts-node src/seed.ts
 *
 * Requiere que MONGODB_URI esté configurado en .env
 * Limpia las colecciones products y users antes de insertar.
 */

import 'reflect-metadata';
import { connect, connection, model, Schema } from 'mongoose';
import { config } from 'dotenv';
import { createHash, randomBytes } from 'crypto';

config(); // cargar .env

// ─── Esquemas inline (para no depender de NestJS) ────────────────────────────
const ProductSchema = new Schema(
  {
    sku: { type: String, unique: true, sparse: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      required: true,
      enum: ['instrumental', 'materiales', 'equipos', 'consumibles', 'proteccion', 'otros'],
    },
    brand: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    stock: { type: Number, required: true, default: 0, min: 0 },
    active: { type: Boolean, required: true, default: true },
    invima: { type: String, default: '' },
    materials: { type: String, default: '' },
    dimensions: { type: String, default: '' },
  },
  { collection: 'products', versionKey: false, timestamps: true },
);
ProductSchema.index({ category: 1 });
ProductSchema.index({ active: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ name: 'text', description: 'text', brand: 'text', sku: 'text' });

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, default: '' },
    role: { type: String, required: true, enum: ['customer', 'admin'], default: 'customer' },
    name: { type: String, required: true, trim: true },
    phone: { type: String, default: '' },
    address: { type: Schema.Types.Mixed, default: null },
    provider: { type: String, required: true, enum: ['local', 'google'], default: 'local' },
    googleId: { type: String, default: null },
    active: { type: Boolean, required: true, default: true },
  },
  { collection: 'users', versionKey: false, timestamps: true },
);

const Product = model('Product', ProductSchema);
const User = model('User', UserSchema);

// ─── Hash helper (mismo formato que AuthService) ─────────────────────────────
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = createHash('sha256')
    .update(salt + password)
    .digest('hex');
  return `${salt}:${hash}`;
}

// ─── Datos de productos ──────────────────────────────────────────────────────
const PRODUCTS = [
  // ── INSTRUMENTAL (instrumentos clínicos) ──────────────────
  {
    sku: 'INS-ESP-001',
    name: 'Espejo Dental #5 con Mango Hueco',
    description:
      'Espejo bucal plano #5 de 24 mm con mango hueco de acero inoxidable. Ideal para exploración e inspección intraoral. Espejo reemplazable con rosca estándar.',
    price: 18500,
    category: 'instrumental',
    brand: 'Hu-Friedy',
    imageUrl: 'https://images.unsplash.com/photo-1609840113640-da51feef8e9f?w=600&q=80',
    stock: 85,
    invima: '2019DM-0018542',
    materials:
      'Espejo: Vidrio óptico de primer superfice\nMango: Acero inoxidable AISI 420\nAcabado: Satinado antirreflejo',
    dimensions: 'Longitud total: 16.5 cm\nDiámetro espejo: 24 mm\nPeso: 28 g',
  },
  {
    sku: 'INS-EXP-002',
    name: 'Explorador Doble #23/17',
    description:
      'Explorador dental doble punta #23/17 para detección de caries y evaluación de restauraciones. Puntas finas y resistentes con angulación ergonómica.',
    price: 22000,
    category: 'instrumental',
    brand: 'Hu-Friedy',
    imageUrl: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&q=80',
    stock: 60,
    invima: '2020DM-0020187',
    materials:
      'Acero inoxidable grado quirúrgico\nMango: Ergonómico con textura antideslizante\nAcabado: Satinado',
    dimensions: 'Longitud: 17 cm\nDiámetro mango: 9.5 mm\nPeso: 32 g',
  },
  {
    sku: 'INS-CUR-003',
    name: 'Cureta Gracey 11/12 Standard',
    description:
      'Cureta Gracey 11/12 para raspado y alisado radicular de superficies mesiales de dientes posteriores. Hoja con filo en un solo borde y ángulo de 70°.',
    price: 45000,
    category: 'instrumental',
    brand: 'Hu-Friedy',
    imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&q=80',
    stock: 35,
    invima: '2018DM-0016234',
    materials:
      'Acero inoxidable endurecido\nMango: #6 Satin Steel\nTipo de filo: Filo simple (un borde cortante)',
    dimensions: 'Longitud: 17.5 cm\nAncho de hoja: 0.9 mm\nPeso: 30 g',
  },
  {
    sku: 'INS-FRC-004',
    name: 'Fórceps Superior #150 Universal',
    description:
      'Fórceps de extracción para premolares superiores universales. Bocados lisos, diseño anatómico para máximo control y mínimo trauma. Articulación tipo americana.',
    price: 95000,
    category: 'instrumental',
    brand: 'Medesy',
    imageUrl: 'https://images.unsplash.com/photo-1583911586285-1a4c99a9e0a1?w=600&q=80',
    stock: 20,
    invima: '2021DM-0022891',
    materials:
      'Acero inoxidable AISI 420B\nAcabado: Pulido espejo\nMangos: Textura cruzada antideslizante',
    dimensions: 'Longitud: 17.5 cm\nApertura de bocados: 25 mm\nPeso: 180 g',
  },
  {
    sku: 'INS-ELV-005',
    name: 'Elevador Recto Seldin #1R',
    description:
      'Elevador recto tipo Seldin para luxación y extracción de raíces y dientes. Hoja de 4 mm, diseño clásico con excelente transmisión de fuerza.',
    price: 38000,
    category: 'instrumental',
    brand: 'Medesy',
    imageUrl: 'https://images.unsplash.com/photo-1606265752439-1f18756aa5fc?w=600&q=80',
    stock: 42,
    invima: '2020DM-0019563',
    materials:
      'Hoja: Acero inoxidable templado\nMango: Acero con acabado texturizado\nTipo: Recto, punta de 4 mm',
    dimensions: 'Longitud: 15.5 cm\nAncho hoja: 4 mm\nPeso: 85 g',
  },

  // ── MATERIALES (restauración, resinas, cementos) ──────────
  {
    sku: 'MAT-RES-006',
    name: 'Resina Filtek Z350 XT A2 Body',
    description:
      'Resina nanoparticulada universal para restauraciones anteriores y posteriores. Color A2 Body. Excelente pulido, resistencia al desgaste y estética natural. Jeringa de 4g.',
    price: 85000,
    category: 'materiales',
    brand: '3M ESPE',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80',
    stock: 120,
    invima: '2017DM-0014789',
    materials:
      'Matriz: Bis-GMA, UDMA, Bis-EMA, TEGDMA\nRelleno: Sílice nanocluster 78.5% en peso\nTipo: Nanohíbrida universal',
    dimensions: 'Jeringa: 4 g\nPresentación: Jeringa compule\nVida útil: 36 meses',
  },
  {
    sku: 'MAT-RES-007',
    name: 'Resina Filtek Z350 XT A3 Body',
    description:
      'Resina nanoparticulada universal A3 Body. Ideal para restauraciones clase I a V. Radiopaca, fotopolimerizable, con fluorescencia natural.',
    price: 85000,
    category: 'materiales',
    brand: '3M ESPE',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80',
    stock: 95,
    invima: '2017DM-0014790',
    materials:
      'Matriz: Bis-GMA, UDMA, Bis-EMA, TEGDMA\nRelleno: Sílice nanocluster 78.5% en peso\nColor: A3 Body (Vita)',
    dimensions: 'Jeringa: 4 g\nProfundidad de curado: 2.5 mm\nVida útil: 36 meses',
  },
  {
    sku: 'MAT-ADH-008',
    name: 'Single Bond Universal 3M',
    description:
      'Adhesivo universal de 7ª generación. Compatible con técnica de grabado total, autograbado y grabado selectivo. Uso directo e indirecto.',
    price: 120000,
    category: 'materiales',
    brand: '3M ESPE',
    imageUrl: 'https://images.unsplash.com/photo-1617791160588-241658ad1792?w=600&q=80',
    stock: 55,
    invima: '2016DM-0013402',
    materials:
      'Composición: MDP, Vitrebond, HEMA, resinas dimetacrilato\nSolvente: Etanol/agua\nTipo: Universal (7ª generación)',
    dimensions: 'Frasco: 5 mL\nAplicaciones aprox: 100\nVida útil: 24 meses',
  },
  {
    sku: 'MAT-CEM-009',
    name: 'Ionómero de Vidrio Ketac Molar 3M',
    description:
      'Ionómero de vidrio de alta viscosidad para restauraciones posteriores en odontopediatría y técnica ART. Liberación de flúor, adhesión química al diente.',
    price: 75000,
    category: 'materiales',
    brand: '3M ESPE',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80',
    stock: 40,
    invima: '2019DM-0017823',
    materials:
      'Polvo: Vidrio de fluoroaluminosilicato de calcio\nLíquido: Ácido poliacrílico, ácido tartárico\nTipo: Ionómero convencional de alta viscosidad',
    dimensions: 'Kit: Polvo 15 g + Líquido 10 mL\nColor: A3\nVida útil: 30 meses',
  },
  {
    sku: 'MAT-GRB-010',
    name: 'Ácido Grabador Scotchbond 37%',
    description:
      'Gel de ácido fosfórico al 37% para grabado ácido del esmalte y dentina. Tixotrópico, fácil control de aplicación, color azul para visualización.',
    price: 28000,
    category: 'materiales',
    brand: '3M ESPE',
    imageUrl: 'https://images.unsplash.com/photo-1617791160588-241658ad1792?w=600&q=80',
    stock: 150,
    invima: '2018DM-0015678',
    materials: 'Ácido fosfórico al 37%\nGel tixotrópico azul\npH: < 1',
    dimensions: 'Jeringa: 5 mL con puntas de aplicación\nPuntas incluidas: 10\nVida útil: 24 meses',
  },

  // ── ENDODONCIA (usando categoría 'otros' ya que no existe en backend) ──────
  // Nota: El backend tiene categorías limitadas. Endodoncia va como 'consumibles'
  {
    sku: 'END-LIM-011',
    name: 'Limas K-File #25 25mm Maillefer',
    description:
      'Limas endodónticas manuales tipo K #25 de 25 mm. Acero inoxidable con punta no cortante. Caja x6 unidades. Codificación de color ISO rojo.',
    price: 32000,
    category: 'consumibles',
    brand: 'Dentsply Maillefer',
    imageUrl: 'https://images.unsplash.com/photo-1626428092596-cc7c6285f6c5?w=600&q=80',
    stock: 80,
    invima: '2019DM-0018234',
    materials:
      'Acero inoxidable flexible\nPunta: No cortante (tipo Batt)\nSección transversal: Cuadrada torsionada',
    dimensions: 'Longitud: 25 mm\nCalibre: #25 (0.25 mm)\nCaja: 6 unidades',
  },
  {
    sku: 'END-LIM-012',
    name: 'Limas Protaper Gold S1-S2-F1-F2-F3',
    description:
      'Sistema rotatorio Protaper Gold surtido (S1, S2, F1, F2, F3). Aleación M-Wire para mayor flexibilidad y resistencia a la fatiga cíclica. Longitud 25 mm.',
    price: 185000,
    category: 'consumibles',
    brand: 'Dentsply Maillefer',
    imageUrl: 'https://images.unsplash.com/photo-1626428092596-cc7c6285f6c5?w=600&q=80',
    stock: 25,
    invima: '2020DM-0020541',
    materials:
      'Aleación: M-Wire (NiTi tratada térmicamente)\nConicidad: Variable progresiva\nSección: Triangular convexa',
    dimensions:
      'Longitud: 25 mm\nKit: 5 limas (S1, S2, F1, F2, F3)\nVelocidad recomendada: 300 RPM',
  },
  {
    sku: 'END-GUT-013',
    name: 'Puntas de Gutapercha #25 Caja x120',
    description:
      'Conos de gutapercha estandarizados ISO #25 para obturación de conductos. Flexibles, radiopacos, con codificación de color.',
    price: 22000,
    category: 'consumibles',
    brand: 'Meta Biomed',
    imageUrl: 'https://images.unsplash.com/photo-1626428092596-cc7c6285f6c5?w=600&q=80',
    stock: 65,
    invima: '2018DM-0016789',
    materials: 'Gutapercha natural\nÓxido de zinc\nRadiopacificador: Sulfato de bario',
    dimensions: 'Calibre: #25 (ISO)\nCaja: 120 puntas\nLongitud: 28 mm',
  },
  {
    sku: 'END-CEM-014',
    name: 'Cemento Endodóntico AH Plus Dentsply',
    description:
      'Sellador de conductos radiculares a base de resina epóxica. Excelente sellado, radiopacidad, estabilidad dimensional y biocompatibilidad. Jeringa de automezcla.',
    price: 145000,
    category: 'consumibles',
    brand: 'Dentsply Maillefer',
    imageUrl: 'https://images.unsplash.com/photo-1617791160588-241658ad1792?w=600&q=80',
    stock: 30,
    invima: '2017DM-0014201',
    materials:
      'Base: Resina epóxica-amina\nRelleno: Óxido de zirconio, sílice\nTipo: Fraguado por polimerización',
    dimensions:
      'Jeringa doble: Pasta A (4 g) + Pasta B (4 g)\nPuntas de mezcla: 15\nTiempo de fraguado: 8 h (37°C)',
  },

  // ── EQUIPOS ───────────────────────────────────────────────
  {
    sku: 'EQP-LAM-015',
    name: 'Lámpara de Fotocurado LED Woodpecker i-LED',
    description:
      'Lámpara de fotocurado LED inalámbrica con potencia de 2300 mW/cm². Modo rampa, estándar y pulso. Batería de litio recargable, punta de 8mm.',
    price: 320000,
    category: 'equipos',
    brand: 'Woodpecker',
    imageUrl: 'https://images.unsplash.com/photo-1589461173000-dd9c5a47f6e2?w=600&q=80',
    stock: 15,
    invima: '2021DM-0022345',
    materials:
      'LED: Chip de alta potencia\nCarcasa: Aluminio anodizado\nPunta: Fibra óptica de 8 mm',
    dimensions: 'Longitud: 24 cm\nPeso: 110 g (sin base)\nBatería: Li-ion 1400 mAh',
  },
  {
    sku: 'EQP-ULT-016',
    name: 'Ultrasonido Dental DTE D5 LED',
    description:
      'Scaler ultrasónico piezoeléctrico con LED incorporado. Compatible con insertos Satelec. Potencia ajustable, botella de agua removible.',
    price: 580000,
    category: 'equipos',
    brand: 'Woodpecker DTE',
    imageUrl: 'https://images.unsplash.com/photo-1589461173000-dd9c5a47f6e2?w=600&q=80',
    stock: 8,
    invima: '2020DM-0019876',
    materials:
      'Pieza de mano: Aleación de titanio con LED\nGenerador: Piezoeléctrico 28-32 kHz\nInsertos: Compatible Satelec/NSK',
    dimensions: 'Potencia: 3W-20W ajustable\nFrecuencia: 28 ± 3 kHz\nPeso unidad: 850 g',
  },
  {
    sku: 'EQP-MIC-017',
    name: 'Micromotor Marathon N7 con Pieza de Mano',
    description:
      'Micromotor eléctrico Marathon N7 de 35.000 RPM con pieza de mano tipo E recta. Control de velocidad por pedal. Ideal para laboratorio y consultorio.',
    price: 450000,
    category: 'equipos',
    brand: 'Saeyang Marathon',
    imageUrl: 'https://images.unsplash.com/photo-1589461173000-dd9c5a47f6e2?w=600&q=80',
    stock: 10,
    invima: '2019DM-0018901',
    materials:
      'Motor: Brushless DC\nPieza de mano: Acero inoxidable tipo E\nMandril: Estándar 2.35 mm',
    dimensions: 'Velocidad: 1.000 – 35.000 RPM\nTorque: 3.0 Ncm\nPeso motor: 190 g',
  },

  // ── PROTECCIÓN PERSONAL ───────────────────────────────────
  {
    sku: 'PRO-GUA-018',
    name: 'Guantes Nitrilo Azul Talla M Caja x100',
    description:
      'Guantes de nitrilo azul sin polvo, talla M. Hipoalergénicos, ambidiestros. Textura en dedos para mejor agarre. Caja x100 unidades.',
    price: 42000,
    category: 'proteccion',
    brand: 'Supermax',
    imageUrl: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=600&q=80',
    stock: 200,
    invima: '2022DM-0024567',
    materials: 'Material: Nitrilo sintético 100%\nSin polvo, sin látex\nColor: Azul',
    dimensions: 'Talla: M (7.0-7.5)\nGrosor: 0.05 mm promedio\nCaja: 100 unidades',
  },
  {
    sku: 'PRO-GUA-019',
    name: 'Guantes Nitrilo Azul Talla S Caja x100',
    description:
      'Guantes de nitrilo azul sin polvo, talla S. Ideales para manos pequeñas. AQL 1.5, grado médico.',
    price: 42000,
    category: 'proteccion',
    brand: 'Supermax',
    imageUrl: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=600&q=80',
    stock: 180,
    invima: '2022DM-0024568',
    materials: 'Material: Nitrilo sintético 100%\nSin polvo, sin látex\nAQL: 1.5',
    dimensions: 'Talla: S (6.5-7.0)\nGrosor: 0.05 mm promedio\nCaja: 100 unidades',
  },
  {
    sku: 'PRO-TAP-020',
    name: 'Tapabocas N95 Caja x20',
    description:
      'Respirador N95 para protección contra partículas y aerosoles en procedimientos dentales. Certificación NIOSH. Ajuste nasal moldeable.',
    price: 65000,
    category: 'proteccion',
    brand: '3M',
    imageUrl: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=600&q=80',
    stock: 75,
    invima: '2021DM-0023001',
    materials:
      'Filtro: Polipropileno multicapa\nClip nasal: Aluminio moldeable\nBandas: Elásticas de caucho sintético',
    dimensions: 'Eficiencia de filtración: ≥ 95%\nCaja: 20 unidades\nColor: Blanco',
  },
  {
    sku: 'PRO-CAR-021',
    name: 'Careta Facial Protectora Antifluidos',
    description:
      'Careta facial transparente antifluidos con soporte ajustable tipo vincha. Visor anti-empañante. Reutilizable y desinfectable.',
    price: 18000,
    category: 'proteccion',
    brand: 'Medi-Protect',
    imageUrl: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=600&q=80',
    stock: 50,
    invima: '2020DM-0020567',
    materials:
      'Visor: PET transparente 0.3 mm\nSoporte: Polipropileno con banda elástica\nAnti-empañante: Tratamiento interno',
    dimensions: 'Área de protección: 32 x 22 cm\nPeso: 60 g\nAjuste: Universal',
  },
  {
    sku: 'PRO-GAF-022',
    name: 'Gafas de Protección Lente Claro',
    description:
      'Gafas de seguridad con lente claro antiempañante y protección lateral. Patillas ajustables, diseño envolvente. Norma ANSI Z87.1.',
    price: 15000,
    category: 'proteccion',
    brand: '3M',
    imageUrl: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=600&q=80',
    stock: 60,
    invima: '2019DM-0018901',
    materials:
      'Lente: Policarbonato antiempañante\nPatillas: Nylon ajustable\nProtección: UV 99.9%',
    dimensions: 'Peso: 26 g\nNorma: ANSI Z87.1\nColor lente: Claro',
  },

  // ── CONSUMIBLES GENERALES ─────────────────────────────────
  {
    sku: 'CON-SUC-023',
    name: 'Eyectores de Saliva Desechables x100',
    description:
      'Eyectores de saliva desechables con punta flexible y alambre interno moldeable. Transparentes con punta blanca. Caja x100.',
    price: 12000,
    category: 'consumibles',
    brand: 'Premium Dental',
    imageUrl: 'https://images.unsplash.com/photo-1609840113640-da51feef8e9f?w=600&q=80',
    stock: 300,
    invima: '2020DM-0020234',
    materials:
      'Tubo: PVC flexible transparente\nPunta: Polipropileno perforado\nAlma: Alambre de cobre recubierto',
    dimensions: 'Longitud: 15 cm\nDiámetro: 6 mm\nCaja: 100 unidades',
  },
  {
    sku: 'CON-ALG-024',
    name: 'Alginato Jeltrate Plus Dentsply 454g',
    description:
      'Alginato cromático para impresiones dentales. Cambio de color indica fase de mezcla y tiempo de trabajo. Excelente detalle y estabilidad dimensional.',
    price: 35000,
    category: 'consumibles',
    brand: 'Dentsply',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80',
    stock: 70,
    invima: '2018DM-0016543',
    materials:
      'Base: Ácido algínico y sales de sodio\nIndicador cromático: Cambio de color\nSabor: Menta',
    dimensions: 'Bolsa: 454 g\nTiempo de mezcla: 45 seg\nTiempo de fraguado: 2 min (boca)',
  },
  {
    sku: 'CON-ROL-025',
    name: 'Rollos de Algodón #2 Bolsa x2000',
    description:
      'Rollos de algodón dental #2 de alta absorción. 100% algodón blanqueado, no estéril. Para aislamiento relativo y control de humedad.',
    price: 25000,
    category: 'consumibles',
    brand: 'Richmond',
    imageUrl: 'https://images.unsplash.com/photo-1609840113640-da51feef8e9f?w=600&q=80',
    stock: 250,
    invima: '2017DM-0014321',
    materials: '100% algodón blanqueado\nNo estéril\nAlta absorción',
    dimensions: 'Tamaño: #2 (10 x 38 mm)\nBolsa: 2000 unidades\nPeso bolsa: 340 g',
  },
  {
    sku: 'CON-DIS-026',
    name: 'Discos de Pulir Sof-Lex 3M Surtido',
    description:
      'Sistema de discos de pulido secuencial Sof-Lex para resinas. Kit surtido con 4 granulometrías (grueso, medio, fino, superfino). Diámetro 12.7 mm.',
    price: 78000,
    category: 'consumibles',
    brand: '3M ESPE',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80',
    stock: 45,
    invima: '2019DM-0017234',
    materials: 'Base: Uretano flexible\nAbrasivo: Óxido de aluminio\n4 granulometrías secuenciales',
    dimensions: 'Diámetro: 12.7 mm\nKit: Surtido (30 discos x grano)\nMandril: Snap-On',
  },

  // ── OTROS ─────────────────────────────────────────────────
  {
    sku: 'OTR-BRK-027',
    name: 'Brackets Metálicos Roth .022 Kit x20',
    description:
      'Brackets metálicos prescripción Roth slot .022". Kit de 5-5 superior e inferior. Base mesh para adhesión mecánica. Incluye caninos, premolares e incisivos.',
    price: 55000,
    category: 'otros',
    brand: 'Morelli',
    imageUrl: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&q=80',
    stock: 30,
    invima: '2021DM-0022567',
    materials: 'Acero inoxidable 17-4 PH\nBase: Mesh 80 gauge\nPrescripción: Roth',
    dimensions: 'Slot: .022" x .028"\nKit: 20 brackets (10+10)\nPerfil: Bajo',
  },
  {
    sku: 'OTR-ARC-028',
    name: 'Arcos NiTi Superelástico .014 Sup x10',
    description:
      'Arcos de ortodoncia NiTi superelástico redondo .014" superior. Paquete x10. Memoria de forma, fuerza constante para alineación inicial.',
    price: 28000,
    category: 'otros',
    brand: 'Morelli',
    imageUrl: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&q=80',
    stock: 55,
    invima: '2020DM-0020987',
    materials: 'Aleación: Níquel-Titanio superelástico\nForma: Ovoide\nSuperficie: Pulida',
    dimensions: 'Calibre: .014" redondo\nForma: Superior ovoide\nPaquete: 10 arcos',
  },
  {
    sku: 'OTR-FLU-029',
    name: 'Flúor en Barniz Duraphat 10mL Colgate',
    description:
      'Barniz de flúor al 5% (22.600 ppm) para prevención de caries y tratamiento de sensibilidad. Adhiere a superficies húmedas. Sabor agradable.',
    price: 68000,
    category: 'otros',
    brand: 'Colgate',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80',
    stock: 35,
    invima: '2018DM-0015432',
    materials:
      'Fluoruro de sodio al 5% (22.600 ppm F)\nBase: Resina natural de colofonia\nSabor: Caramelo',
    dimensions: 'Tubo: 10 mL\nAplicaciones aprox: 40\nVida útil: 36 meses',
  },
  {
    sku: 'OTR-BLQ-030',
    name: 'Anestesia Lidocaína 2% con Epinefrina Caja x50',
    description:
      'Cartuchos de anestesia local Lidocaína 2% con Epinefrina 1:80.000. Caja x50 cartuchos de 1.8 mL. Para anestesia infiltrativa y troncular.',
    price: 95000,
    category: 'otros',
    brand: 'New Stetic',
    imageUrl: 'https://images.unsplash.com/photo-1617791160588-241658ad1792?w=600&q=80',
    stock: 100,
    invima: '2022DM-0024123',
    materials: 'Lidocaína HCl 2%\nEpinefrina 1:80.000\nSolución inyectable estéril',
    dimensions: 'Cartucho: 1.8 mL\nCaja: 50 cartuchos\nAlmacenamiento: 15-25°C proteger de la luz',
  },
];

// ─── Usuarios demo ───────────────────────────────────────────────────────────
const USERS = [
  {
    email: 'admin@dentalpitalito.com',
    passwordHash: hashPassword('Admin2024!'),
    role: 'admin',
    name: 'Administrador Dental Edna',
    phone: '3143541941',
    provider: 'local',
    active: true,
  },
  {
    email: 'doctor@clinicapitalito.com',
    passwordHash: hashPassword('Doctor2024!'),
    role: 'customer',
    name: 'Dr. Carlos Méndez',
    phone: '3201234567',
    address: {
      street: 'Cra 4 #8-52 Consultorio 203',
      city: 'Pitalito',
      department: 'Huila',
      postalCode: '417030',
    },
    provider: 'local',
    active: true,
  },
  {
    email: 'laura.ortiz@gmail.com',
    passwordHash: hashPassword('Laura2024!'),
    role: 'customer',
    name: 'Dra. Laura Ortiz',
    phone: '3156789012',
    address: {
      street: 'Cl 1 #5-30 Local 8',
      city: 'Pitalito',
      department: 'Huila',
      postalCode: '417030',
    },
    provider: 'local',
    active: true,
  },
  {
    email: 'estudiante.odonto@ucc.edu.co',
    passwordHash: hashPassword('Estudiante2024!'),
    role: 'customer',
    name: 'Andrés Peña',
    phone: '3009876543',
    provider: 'local',
    active: true,
  },
];

// ─── Ejecutar seed ───────────────────────────────────────────────────────────
async function seed() {
  const uri = process.env['MONGODB_URI'];
  const dbName = process.env['MONGODB_DB_NAME'] || 'deposito_dental';

  if (!uri) {
    console.error('❌ MONGODB_URI no está configurado en .env');
    process.exit(1);
  }

  console.log(`🔗 Conectando a MongoDB Atlas (${dbName})...`);
  await connect(uri, { dbName });
  console.log('✅ Conexión exitosa\n');

  // ── Limpiar colecciones ────────────────────────────────
  console.log('🗑️  Limpiando colecciones...');
  await Product.deleteMany({});
  await User.deleteMany({});
  console.log('   products: vaciada');
  console.log('   users: vaciada\n');

  // ── Insertar productos ─────────────────────────────────
  console.log(`📦 Insertando ${PRODUCTS.length} productos...`);
  const inserted = await Product.insertMany(PRODUCTS);
  console.log(`   ✅ ${inserted.length} productos insertados\n`);

  // Resumen por categoría
  const byCategory: Record<string, number> = {};
  PRODUCTS.forEach((p) => {
    byCategory[p.category] = (byCategory[p.category] || 0) + 1;
  });
  console.log('   Resumen por categoría:');
  Object.entries(byCategory).forEach(([cat, count]) => {
    console.log(`     • ${cat}: ${count} productos`);
  });

  // ── Insertar usuarios ──────────────────────────────────
  console.log(`\n👥 Insertando ${USERS.length} usuarios...`);
  const insertedUsers = await User.insertMany(USERS);
  console.log(`   ✅ ${insertedUsers.length} usuarios insertados\n`);

  console.log('   Credenciales de prueba:');
  console.log('   ┌─────────────────────────────────────┬──────────────────┐');
  console.log('   │ Email                               │ Contraseña       │');
  console.log('   ├─────────────────────────────────────┼──────────────────┤');
  console.log('   │ admin@dentalpitalito.com            │ Admin2024!       │');
  console.log('   │ doctor@clinicapitalito.com          │ Doctor2024!      │');
  console.log('   │ laura.ortiz@gmail.com               │ Laura2024!       │');
  console.log('   │ estudiante.odonto@ucc.edu.co        │ Estudiante2024!  │');
  console.log('   └─────────────────────────────────────┴──────────────────┘');

  console.log('\n🎉 Seed completado exitosamente.');
  await connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Error en seed:', err);
  connection.close().finally(() => process.exit(1));
});
