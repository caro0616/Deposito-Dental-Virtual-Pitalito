import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CatalogService } from '../application/catalog.service';

interface UploadedAttachment {
  buffer: Buffer;
  mimetype: string;
}

@Controller('products')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  /**
   * US-01: catálogo público
   * US-02: filtrar por categoría (?category=instrumental)
   * US-04: filtros combinados (?available=true&minPrice=0&maxPrice=100)
   */
  @Get()
  async listProducts(
    @Query('category') category?: string,
    @Query('available') available?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
  ) {
    const hasFilters = available !== undefined || minPrice !== undefined || maxPrice !== undefined;

    if (hasFilters || category) {
      return this.catalogService.filter({
        category,
        available: available === 'true' ? true : undefined,
        minPrice: minPrice !== undefined ? Number(minPrice) : undefined,
        maxPrice: maxPrice !== undefined ? Number(maxPrice) : undefined,
      });
    }

    return this.catalogService.getPublicCatalog();
  }

  /** US-02: lista de categorías con conteo de productos */
  @Get('categories')
  async listCategories() {
    return this.catalogService.getCategoriesWithCount();
  }

  /**
   * US-03: búsqueda por nombre o referencia (?q=lima)
   * Soporta búsquedas parciales.
   */
  @Get('search')
  async search(@Query('q') query: string) {
    return this.catalogService.search(query ?? '');
  }

  /** US-05 / US-06: ficha técnica e INVIMA */
  @Get(':id')
  async getProduct(@Param('id') id: string) {
    return this.catalogService.getProductById(id);
  }

  /** Analiza un PDF o imagen para recomendar productos del inventario */
  @Post('analyze-file')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 8 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowed = ['application/pdf', 'image/png', 'image/jpeg'];
        if (!allowed.includes(file.mimetype)) {
          cb(new Error('Tipo de archivo no permitido'), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  async analyzeFile(@UploadedFile() file?: UploadedAttachment) {
    if (!file) {
      throw new BadRequestException('Debes adjuntar un archivo PNG, JPG/JPEG o PDF.');
    }
    return this.catalogService.searchFromAttachment(file);
  }
}
