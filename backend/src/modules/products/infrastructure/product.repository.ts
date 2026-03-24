import { Injectable } from '@nestjs/common';
import { Product } from '../domain/product.entity';

export abstract class ProductRepository {
  abstract findAll(): Promise<Product[]>;
  abstract findById(id: string): Promise<Product | null>;
  abstract search(query: string): Promise<Product[]>;
  abstract filterByCategory(category: string): Promise<Product[]>;
  abstract findByInvimaCode(invimaCode: string): Promise<Product | null>;
}

@Injectable()
export class InMemoryProductRepository implements ProductRepository {
  private products: Product[] = [
    new Product(
      '1',
      'Guantes de látex',
      'Guantes estériles para procedimientos dentales',
      5.99,
      'esterilizacion',
      100,
      'INVIMA-2024-001',
    ),
    new Product(
      '2',
      'Anestésico local',
      'Lidocaína al 2% para anestesia dental',
      15.5,
      'odontologia_general',
      50,
      'INVIMA-2024-002',
    ),
    new Product(
      '3',
      'Implante dental',
      'Implante de titanio para reemplazo dental',
      250.0,
      'cirugia_oral',
      20,
      'INVIMA-2024-003',
    ),
    new Product(
      '4',
      'Resina compuesta',
      'Resina para restauraciones dentales',
      45.0,
      'odontologia_general',
      30,
      'INVIMA-2024-004',
    ),
    new Product(
      '5',
      'Equipo de rayos X',
      'Equipo portátil para radiografías dentales',
      1200.0,
      'radiologia',
      5,
      'INVIMA-2024-005',
    ),
    new Product(
      '6',
      'Cepillos interdentales',
      'Cepillos para limpieza interdental',
      8.99,
      'periodoncia',
      200,
      'INVIMA-2024-006',
    ),
    new Product(
      '7',
      'Endodoncista motor',
      'Motor para tratamientos de conductos',
      350.0,
      'endodoncia',
      10,
      'INVIMA-2024-007',
    ),
    new Product(
      '8',
      'Gel fluorado',
      'Gel para aplicación tópica de flúor',
      12.0,
      'odontologia_general',
      75,
      'INVIMA-2024-008',
    ),
    new Product(
      '9',
      'Brackets metálicos',
      'Brackets para ortodoncia fija',
      150.0,
      'ortodoncia',
      25,
      'INVIMA-2024-009',
    ),
    new Product(
      '10',
      'Alineadores invisibles',
      'Juego de alineadores transparentes',
      2000.0,
      'ortodoncia',
      15,
      'INVIMA-2024-010',
    ),
    new Product(
      '11',
      'Corona dental',
      'Corona de porcelana para restauración',
      180.0,
      'protesis',
      40,
      'INVIMA-2024-011',
    ),
    new Product(
      '12',
      'Dentadura completa',
      'Prótesis dental removible',
      300.0,
      'protesis',
      12,
      'INVIMA-2024-012',
    ),
    new Product(
      '13',
      'Ultrasonido periodontal',
      'Dispositivo para limpieza de encías',
      75.0,
      'periodoncia',
      18,
      'INVIMA-2024-013',
    ),
    new Product(
      '14',
      'Bisturí quirúrgico',
      'Bisturí estéril para cirugía oral',
      20.0,
      'cirugia_oral',
      60,
      'INVIMA-2024-014',
    ),
    new Product(
      '15',
      'Amalgama dental',
      'Material para obturaciones',
      25.0,
      'odontologia_general',
      80,
      'INVIMA-2024-015',
    ),
    new Product(
      '16',
      'Sensor digital RX',
      'Sensor intraoral para radiografías',
      800.0,
      'radiologia',
      8,
      'INVIMA-2024-016',
    ),
    new Product(
      '17',
      'Lima endodóntica',
      'Limas rotatorias para conductos',
      40.0,
      'endodoncia',
      35,
      'INVIMA-2024-017',
    ),
    new Product(
      '18',
      'Autoclave',
      'Equipo de esterilización por vapor',
      1500.0,
      'esterilizacion',
      3,
      'INVIMA-2024-018',
    ),
    new Product(
      '19',
      'Máscara quirúrgica',
      'Máscaras desechables para protección',
      3.5,
      'esterilizacion',
      500,
      'INVIMA-2024-019',
    ),
    new Product(
      '20',
      'Cemento temporal',
      'Cemento para fijación provisional',
      15.0,
      'odontologia_general',
      90,
      'INVIMA-2024-020',
    ),
  ];

  async findAll(): Promise<Product[]> {
    return this.products;
  }

  async findById(id: string): Promise<Product | null> {
    return this.products.find((product) => product.id === id) || null;
  }

  async search(query: string): Promise<Product[]> {
    const lowerQuery = query.toLowerCase();
    return this.products.filter(
      (product) =>
        product.name.toLowerCase().includes(lowerQuery) ||
        product.description.toLowerCase().includes(lowerQuery),
    );
  }

  async filterByCategory(category: string): Promise<Product[]> {
    return this.products.filter((product) => product.category === category);
  }

  async findByInvimaCode(invimaCode: string): Promise<Product | null> {
    return this.products.find((product) => product.invimaRegistrationCode === invimaCode) || null;
  }
}
