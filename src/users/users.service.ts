import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dtos/user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      include: {
        Profile: true,
      },
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        Profile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async create(createUserDto: CreateUserDto) {
    const { email, password, profile } = createUserDto;

    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    return this.prisma.user.create({
      data: {
        email,
        password,
        Profile: {
          create: profile,
        },
      },
      include: {
        Profile: true,
      },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const { email, password, profile } = updateUserDto;

    if (!email && !password && !profile) {
      throw new BadRequestException('At least one field (email, password, or profile) is required for update');
    }

    const existingUser = await this.findOne(id);

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    if (email && email !== existingUser.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email },
      });

      if (emailExists) {
        throw new ConflictException('Email already exists');
      }
    }

    const updateData: {
      email?: string;
      password?: string;
      Profile?: {
        update?: any;
        create?: any;
      };
    } = {};

    if (email) updateData.email = email;
    if (password) updateData.password = password;

    if (profile) {
      if (existingUser.Profile) {
        // Update existing profile
        updateData.Profile = {
          update: profile,
        };
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        Profile: true,
      },
    });
  }

  async delete(id: number) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Delete the profile first to avoid foreign key constraint violation
    await this.prisma.profile.delete({
      where: { userId: id },
    });

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }
}
