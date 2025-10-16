import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from './user.model';

@Injectable()
export class UsersService {
  private users: User[] = [
    { id: '1', name: 'Alice', email: 'alice@mail.com' },
    { id: '2', name: 'Bob', email: 'bob@mail.com' },
    { id: '3', name: 'Charlie', email: 'charlie@mail.com' },
  ];

  findAll() {
    return this.users;
  }

  findOne(id: string) {
    const user = this.users.find((user) => user.id === id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  create(body: Omit<User, 'id'>) {
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

  update(id: string, updates: Partial<Omit<User, 'id'>>) {
    if (!updates.name && !updates.email) {
      throw new BadRequestException('At least one field (name or email) is required for update');
    }

    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      throw new NotFoundException('User not found');
    }

    if (updates.email && updates.email !== this.users[userIndex].email) {
      const emailExists = this.users.some((user) => user.email === updates.email);
      if (emailExists) {
        throw new ConflictException('Email already exists');
      }
    }

    this.users[userIndex] = { ...this.users[userIndex], ...updates };
    return this.users[userIndex];
  }

  delete(id: string) {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      throw new NotFoundException('User not found');
    }

    this.users = this.users.filter((user) => user.id !== id);
    return { message: 'User deleted successfully' };
  }
}
