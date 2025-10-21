import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateProfileDto, UpdateProfileDto } from './profile.dto';
import { Type } from 'class-transformer';
import { IsString, IsEmail, IsNotEmpty, MinLength, ValidateNested, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ValidateNested()
  @Type(() => CreateProfileDto)
  @IsNotEmpty()
  profile: CreateProfileDto;
}

export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['profile'])) {
  @ValidateNested()
  @Type(() => UpdateProfileDto)
  @IsOptional()
  profile: UpdateProfileDto;
}
