import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  // exports: [UsersService], // Compartir el servicio si es necesario en otros módulos
})
export class UsersModule {}
