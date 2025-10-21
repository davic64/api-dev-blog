import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsNotEmpty, IsUrl } from 'class-validator';

export class CreateProfileDto {
  @IsString()
  @IsNotEmpty()
  bio: string;

  @IsString()
  @IsUrl()
  @IsNotEmpty()
  avatarUrl: string;
}

export class UpdateProfileDto extends PartialType(CreateProfileDto) {}
