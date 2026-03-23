import { Body, Controller, Param, Patch } from '@nestjs/common';
import { CartService } from '../application/cart.service';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // TODO: replace hardcoded user with authenticated user id
  private readonly demoUserId = 'demo-user';

  @Patch('items/:itemId')
  async updateItemQuantity(@Param('itemId') itemId: string, @Body() body: UpdateCartItemDto) {
    const cart = await this.cartService.updateItemQuantity(this.demoUserId, itemId, body.quantity);

    return {
      id: cart.id,
      userId: cart.userId,
      total: cart.total,
      items: cart.items,
    };
  }
}
