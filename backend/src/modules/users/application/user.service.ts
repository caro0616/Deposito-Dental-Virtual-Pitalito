import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDoc, UserDocument } from '../infrastructure/persistence/schemas/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserDoc.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async findById(id: string): Promise<UserDoc | null> {
    return this.userModel.findById(id).exec();
  }
}
