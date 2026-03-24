import { Controller, Get, Param, Query } from '@nestjs/common';
import { CatalogService } from '../application/catalog.service';

@Controller('products')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  async listProducts(@Query('category') category?: string) {
    if (category) {
      return this.catalogService.getByCategory(category);
    }
    return this.catalogService.getPublicCatalog();
  }

  @Get(':id')
  async getProduct(@Param('id') id: string) {
    return this.catalogService.getProductById(id);
  }
}
