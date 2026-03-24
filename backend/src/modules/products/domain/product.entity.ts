export type ProductCategory =
  | 'odontologia_general'
  | 'endodoncia'
  | 'ortodoncia'
  | 'periodoncia'
  | 'cirugia_oral'
  | 'protesis'
  | 'radiologia'
  | 'esterilizacion';

export class Product {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly price: number,
    public readonly category: ProductCategory,
    public readonly stock: number = 0,
    public readonly invimaRegistrationCode: string,
  ) {}
}
