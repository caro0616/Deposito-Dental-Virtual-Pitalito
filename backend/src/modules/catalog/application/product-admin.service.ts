import { Injectable, NotFoundException } from '@nestjs/common';
import { Product } from '../domain/product.entity';
import { ProductRepository } from '../infrastructure/product.repository';
import { CreateProductDto } from '../presentation/dto/create-product.dto';
import { UpdateProductDto } from '../presentation/dto/update-product.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class ProductAdminService {
  constructor(private readonly productRepo: ProductRepository) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const product = new Product(
      randomUUID(),
      dto.name,
      dto.description,
      dto.price,
      dto.imageUrl,
      dto.category,
      dto.stock,
      dto.active ?? true,
    );
    await this.productRepo.save(product);
    return product;
  }

  async listAll(): Promise<Product[]> {
    return this.productRepo.findAll();
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.productRepo.findById(id);
    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }

    if (dto.name !== undefined) product.name = dto.name;
    if (dto.description !== undefined) product.description = dto.description;
    if (dto.price !== undefined) product.price = dto.price;
    if (dto.imageUrl !== undefined) product.imageUrl = dto.imageUrl;
    if (dto.category !== undefined) product.category = dto.category;
    if (dto.stock !== undefined) product.updateStock(dto.stock);
    if (dto.active !== undefined) {
      if (dto.active) {
        product.activate();
      } else {
        product.deactivate();
      }
    }

    await this.productRepo.save(product);
    return product;
  }

  async delete(id: string): Promise<void> {
    const product = await this.productRepo.findById(id);
    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }
    await this.productRepo.delete(id);
  }
}
