import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IOrderRepository } from '../order.repository';
import {
  Order,
  OrderItem,
  OrderStatus,
  OrderStatusChange,
  OrderCheckoutDetails,
} from '../../domain/order.entity';
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

  /** US-10: historial de órdenes de un usuario específico */
  async findByUserId(userId: string): Promise<Order[]> {
    if (!Types.ObjectId.isValid(userId)) return [];
    const docs = await this.orderModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean<Array<OrderDoc & { _id: Types.ObjectId }>>()
      .exec();
    return docs.map((doc) => this.toDomain(doc));
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
      await this.orderModel
        .findByIdAndUpdate(
          order.id,
          { $set: { status: order.status, statusHistory, updatedAt: new Date(), orderNumber: order.orderNumber } },
          { returnDocument: 'after' },
        )
        .exec();
    } else {
      const created = await this.orderModel.create({
        userId: Types.ObjectId.isValid(order.userId)
          ? new Types.ObjectId(order.userId)
          : new Types.ObjectId(),
        items,
        total: order.total,
        customer: order.checkoutDetails?.customer,
        shipping: order.checkoutDetails?.shipping,
        payment: order.checkoutDetails?.payment,
        status: order.status,
        statusHistory,
        orderNumber: order.orderNumber,
        createdAt: order.createdAt || new Date(),
      });
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

    const checkoutDetails: OrderCheckoutDetails | undefined =
      doc.customer && doc.shipping && doc.payment
        ? {
            customer: {
              fullName: doc.customer.fullName,
              email: doc.customer.email,
              phone: doc.customer.phone,
              documentType: doc.customer.documentType,
              documentNumber: doc.customer.documentNumber,
            },
            shipping: {
              department: doc.shipping.department,
              city: doc.shipping.city,
              addressLine1: doc.shipping.addressLine1,
              addressLine2: doc.shipping.addressLine2,
              reference: doc.shipping.reference,
            },
            payment: {
              method: doc.payment.method,
              cardBrand: doc.payment.cardBrand,
            },
          }
        : undefined;

    return new Order(
      doc._id.toHexString(),
      (doc.userId as Types.ObjectId).toHexString(),
      items,
      doc.total,
      checkoutDetails,
      doc.status as OrderStatus,
      statusHistory,
      doc.orderNumber,
      doc.createdAt,
    );
  }
}
