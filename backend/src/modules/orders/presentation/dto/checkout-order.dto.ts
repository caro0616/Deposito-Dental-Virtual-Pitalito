import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CardBrand, CustomerDocumentType, PaymentMethod } from '../../domain/order.entity';

class CheckoutCustomerDto {
  @IsString()
  @Length(3, 120)
  fullName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @Length(7, 20)
  phone!: string;

  @IsEnum(['cc', 'ce', 'nit', 'passport'] satisfies CustomerDocumentType[])
  documentType!: CustomerDocumentType;

  @IsString()
  @Length(5, 32)
  documentNumber!: string;
}

class CheckoutShippingDto {
  @IsString()
  @Length(2, 80)
  department!: string;

  @IsString()
  @Length(2, 80)
  city!: string;

  @IsString()
  @Length(5, 160)
  addressLine1!: string;

  @IsOptional()
  @IsString()
  @Length(0, 160)
  addressLine2?: string;

  @IsOptional()
  @IsString()
  @Length(0, 160)
  reference?: string;
}

class CheckoutPaymentDto {
  @IsEnum(['pse', 'card'] satisfies PaymentMethod[])
  method!: PaymentMethod;

  @ValidateIf((value: CheckoutPaymentDto) => value.method === 'card')
  @IsEnum(['visa', 'mastercard', 'amex'] satisfies CardBrand[])
  cardBrand?: CardBrand;
}

export class CheckoutOrderDto {
  @ValidateNested()
  @Type(() => CheckoutCustomerDto)
  customer!: CheckoutCustomerDto;

  @ValidateNested()
  @Type(() => CheckoutShippingDto)
  shipping!: CheckoutShippingDto;

  @ValidateNested()
  @Type(() => CheckoutPaymentDto)
  payment!: CheckoutPaymentDto;
}
