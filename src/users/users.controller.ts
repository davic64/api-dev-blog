import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, BadRequestException, ConflictException } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './user.dto';

interface User {
  id: string;
  name: string;
  email: string;
}

@Controller('users')
export class UsersController {
  private users: User[] = [
    { id: '1', name: 'Alice', email: 'alice@mail.com' },
    { id: '2', name: 'Bob', email: 'bob@mail.com' },
    { id: '3', name: 'Charlie', email: 'charlie@mail.com' },
  ];

  @Get()
  getAllUsers(): User[] {
    return this.users;
  }

  @Get(':id')
  findUserById(@Param('id') id: string) {
    const user = this.users.find((user) => user.id === id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Post()
  createUser(@Body() body: CreateUserDto) {
    if (!body.name || !body.email) {
      throw new BadRequestException('Name and email are required');
    }

    const existingUser = this.users.find((user) => user.email === body.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const id: string = String(this.users.length + 1);
    const newUser = { ...body, id };
    this.users.push(newUser);
    return newUser;
  }

  @Put(':id')
  updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    if (!body.name && !body.email) {
      throw new BadRequestException('At least one field (name or email) is required for update');
    }

    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      throw new NotFoundException('User not found');
    }

    if (body.email && body.email !== this.users[userIndex].email) {
      const emailExists = this.users.some((user) => user.email === body.email);
      if (emailExists) {
        throw new ConflictException('Email already exists');
      }
    }

    this.users[userIndex] = { ...this.users[userIndex], ...body };
    return this.users[userIndex];
  }

  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      throw new NotFoundException('User not found');
    }

    this.users = this.users.filter((user) => user.id !== id);
    return { message: 'User deleted successfully' };
  }
}
