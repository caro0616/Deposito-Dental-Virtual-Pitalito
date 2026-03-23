import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Cart } from '../domain/cart.entity';
import { CartRepository } from '../infrastructure/cart.repository';

@Injectable()
export class CartService {
  constructor(private readonly cartRepository: CartRepository) {}

  async getUserCart(userId: string): Promise<Cart> {
    const cart = await this.cartRepository.findByUserId(userId);
    if (!cart) {
      throw new NotFoundException('Cart not found for user');
    }
    return cart;
  }

  async updateItemQuantity(userId: string, itemId: string, quantity: number): Promise<Cart> {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new BadRequestException('Quantity must be a positive integer');
    }

    const cart = await this.cartRepository.findByUserId(userId);
    if (!cart) {
      throw new NotFoundException('Cart not found for user');
    }

    try {
      cart.updateItemQuantity(itemId, quantity);
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }

    await this.cartRepository.save(cart);
    return cart;
  }
}
