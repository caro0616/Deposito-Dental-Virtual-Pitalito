import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IOrderRepository } from '../order.repository';
import { Order, OrderItem, OrderStatus, OrderStatusChange } from '../../domain/order.entity';
import { OrderDoc, OrderDocument } from './schemas/order.schema';

/**
 * Mongoose-backed implementation of IOrderRepository.
 * Persists order data to the 'orders' collection in MongoDB Atlas.
 */
@Injectable()
export class MongooseOrderRepository implements IOrderRepository {
  constructor(
    @InjectModel(OrderDoc.name)
    private readonly orderModel: Model<OrderDocument>,
  ) {}

  async findAll(): Promise<Order[]> {
    const docs = await this.orderModel
      .find()
      .sort({ createdAt: -1 })
      .lean<Array<OrderDoc & { _id: Types.ObjectId }>>()
      .exec();

    return docs.map((doc) => this.toDomain(doc));
  }

  async findById(id: string): Promise<Order | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const doc = await this.orderModel
      .findById(id)
      .lean<OrderDoc & { _id: Types.ObjectId }>()
      .exec();

    if (!doc) return null;

    return this.toDomain(doc);
  }

  async save(order: Order): Promise<void> {
    const items = order.items.map((item) => ({
      productId: Types.ObjectId.isValid(item.productId)
        ? new Types.ObjectId(item.productId)
        : new Types.ObjectId(),
      name: item.name,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      subtotal: item.subtotal,
    }));

    const statusHistory = order.statusHistory.map((sh) => ({
      from: sh.from,
      to: sh.to,
      changedAt: sh.changedAt,
      changedBy: sh.changedBy,
    }));

    if (Types.ObjectId.isValid(order.id)) {
      // Update existing document (e.g. status change)
      await this.orderModel
        .findByIdAndUpdate(
          order.id,
          {
            $set: {
              status: order.status,
              statusHistory,
              updatedAt: new Date(),
            },
          },
          { new: true },
        )
        .exec();
    } else {
      // Create new document (checkout flow — id is a UUID from the domain layer)
      const created = await this.orderModel.create({
        userId: Types.ObjectId.isValid(order.userId)
          ? new Types.ObjectId(order.userId)
          : new Types.ObjectId(),
        items,
        total: order.total,
        status: order.status,
        statusHistory,
      });

      // Reflect the persisted ObjectId back onto the domain object so callers
      // can use the real database id immediately after save().
      (order as { id: string }).id = (created._id as Types.ObjectId).toHexString();
    }
  }

  // ─── Mapping helpers ────────────────────────────────────────────────────────

  private toDomain(doc: OrderDoc & { _id: Types.ObjectId }): Order {
    const items: OrderItem[] = (doc.items ?? []).map((item) => ({
      productId: (item.productId as Types.ObjectId).toHexString(),
      name: item.name,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      subtotal: item.subtotal,
    }));

    const statusHistory: OrderStatusChange[] = (doc.statusHistory ?? []).map((sh) => ({
      from: sh.from as OrderStatus | null,
      to: sh.to as OrderStatus,
      changedAt: sh.changedAt,
      changedBy: sh.changedBy,
    }));

    return new Order(
      doc._id.toHexString(),
      (doc.userId as Types.ObjectId).toHexString(),
      items,
      doc.total,
      doc.status as OrderStatus,
      statusHistory,
    );
  }
}
