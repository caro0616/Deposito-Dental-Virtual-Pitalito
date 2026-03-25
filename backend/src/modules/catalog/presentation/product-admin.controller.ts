import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ProductAdminService } from '../application/product-admin.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('admin/products')
export class ProductAdminController {
  constructor(private readonly productAdminService: ProductAdminService) {}

  @Get()
  async listAll() {
    return this.productAdminService.listAll();
  }

  @Post()
  async create(@Body() dto: CreateProductDto) {
    return this.productAdminService.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productAdminService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.productAdminService.delete(id);
    return { deleted: true };
  }
}
