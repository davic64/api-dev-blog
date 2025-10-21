import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      include: {
        posts: {
          include: {
            post: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        posts: {
          include: {
            post: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async create(createCategoryDto: CreateCategoryDto) {
    const { name, slug, description } = createCategoryDto;

    if (!name || !slug) {
      throw new BadRequestException('Name and slug are required');
    }

    // Check if category with same name exists
    const existingCategoryByName = await this.prisma.category.findUnique({
      where: { name },
    });

    if (existingCategoryByName) {
      throw new ConflictException('Category with this name already exists');
    }

    // Check if category with same slug exists
    const existingCategoryBySlug = await this.prisma.category.findUnique({
      where: { slug },
    });

    if (existingCategoryBySlug) {
      throw new ConflictException('Category with this slug already exists');
    }

    return this.prisma.category.create({
      data: {
        name,
        slug,
        description,
      },
      include: {
        posts: {
          include: {
            post: true,
          },
        },
      },
    });
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const { name, slug, description } = updateCategoryDto;

    if (!name && !slug && !description) {
      throw new BadRequestException('At least one field (name, slug, or description) is required for update');
    }

    const existingCategory = await this.findOne(id);

    if (!existingCategory) {
      throw new NotFoundException('Category not found');
    }

    // Check for unique constraints if name or slug are being updated
    if (name && name !== existingCategory.name) {
      const nameExists = await this.prisma.category.findUnique({
        where: { name },
      });

      if (nameExists) {
        throw new ConflictException('Category with this name already exists');
      }
    }

    if (slug && slug !== existingCategory.slug) {
      const slugExists = await this.prisma.category.findUnique({
        where: { slug },
      });

      if (slugExists) {
        throw new ConflictException('Category with this slug already exists');
      }
    }

    const updateData: {
      name?: string;
      slug?: string;
      description?: string;
    } = {};

    if (name) updateData.name = name;
    if (slug) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;

    return this.prisma.category.update({
      where: { id },
      data: updateData,
      include: {
        posts: {
          include: {
            post: true,
          },
        },
      },
    });
  }

  async remove(id: number) {
    const existingCategory = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw new NotFoundException('Category not found');
    }

    // Check if category has posts
    const categoryWithPosts = await this.prisma.category.findUnique({
      where: { id },
      include: {
        posts: true,
      },
    });

    if (categoryWithPosts && categoryWithPosts.posts.length > 0) {
      throw new BadRequestException('Cannot delete category that has posts. Please reassign or delete the posts first.');
    }

    await this.prisma.category.delete({
      where: { id },
    });

    return { message: 'Category deleted successfully' };
  }
}
