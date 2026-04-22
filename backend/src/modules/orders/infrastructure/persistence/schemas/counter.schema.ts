import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CounterDocument = CounterDoc & Document;

@Schema({
  collection: 'counters',
  versionKey: false,
  timestamps: false,
})
export class CounterDoc {
  @Prop({ required: true, unique: true, index: true })
  key!: string;

  @Prop({ required: true, default: 0 })
  seq!: number;
}

export const CounterSchema = SchemaFactory.createForClass(CounterDoc);
