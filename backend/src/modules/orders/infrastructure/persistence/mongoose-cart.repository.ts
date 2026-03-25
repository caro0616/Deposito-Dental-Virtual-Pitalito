import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ICartRepository } from '../cart.repository';
import { Cart, CartItem } from '../../domain/cart.entity';
import { CartDoc, CartDocument, CartItemSubdoc } from './schemas/cart.schema';

/**
 * Mongoose-backed implementation of ICartRepository.
 * Persists cart data to the 'carts' collection in MongoDB Atlas.
 */
@Injectable()
export class MongooseCartRepository implements ICartRepository {
  constructor(
    @InjectModel(CartDoc.name)
    private readonly cartModel: Model<CartDocument>,
  ) {}

  async findByUserId(userId: string): Promise<Cart | null> {
    if (!Types.ObjectId.isValid(userId)) {
      return null;
    }

    const doc = await this.cartModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .lean<CartDoc & { _id: Types.ObjectId }>()
      .exec();

    if (!doc) return null;

    return this.toDomain(doc);
  }

  async save(cart: Cart): Promise<void> {
    const items: CartItemSubdoc[] = cart.items.map((item) => {
      const subdoc = new CartItemSubdoc();
      subdoc._id = Types.ObjectId.isValid(item.id)
        ? new Types.ObjectId(item.id)
        : new Types.ObjectId();
      subdoc.productId = Types.ObjectId.isValid(item.productId)
        ? new Types.ObjectId(item.productId)
        : new Types.ObjectId();
      subdoc.name = item.name;
      subdoc.unitPrice = item.unitPrice;
      subdoc.quantity = item.quantity;
      subdoc.subtotal = item.subtotal;
      return subdoc;
    });

    await this.cartModel
      .findOneAndUpdate(
        { userId: new Types.ObjectId(cart.userId) },
        {
          $set: {
            userId: new Types.ObjectId(cart.userId),
            items,
            total: cart.total,
          },
        },
        { upsert: true, new: true },
      )
      .exec();
  }

  // ─── Mapping helpers ────────────────────────────────────────────────────────

  private toDomain(doc: CartDoc & { _id: Types.ObjectId }): Cart {
    const items: CartItem[] = (doc.items ?? []).map((item) => ({
      id: (item._id as Types.ObjectId).toHexString(),
      productId: (item.productId as Types.ObjectId).toHexString(),
      name: item.name,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      subtotal: item.subtotal,
    }));

    return new Cart(
      doc._id.toHexString(),
      (doc.userId as Types.ObjectId).toHexString(),
      items,
      doc.total,
    );
  }
}
