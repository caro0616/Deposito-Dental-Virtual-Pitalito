import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './application/user.service';
import { UserDoc, UserSchema } from './infrastructure/persistence/schemas/user.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: UserDoc.name, schema: UserSchema }])],
  providers: [UserService],
  exports: [UserService],
})
export class UsersModule {}
