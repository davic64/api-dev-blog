import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.post.findMany();
  }

  async findOne(id: number) {
    const post = await this.prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async create(createPostDto: CreatePostDto) {
    const { title, content } = createPostDto;

    if (!title || !content) {
      throw new BadRequestException('Title and content are required');
    }

    return this.prisma.post.create({
      data: {
        title,
        content,
      },
    });
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    const { title, content } = updatePostDto;

    if (!title && !content) {
      throw new BadRequestException('At least one field (title or content) is required for update');
    }

    const existingPost = await this.findOne(id);

    if (!existingPost) {
      throw new NotFoundException('Post not found');
    }

    const updateData: {
      title?: string;
      content?: string;
    } = {};

    if (title) updateData.title = title;
    if (content) updateData.content = content;

    return this.prisma.post.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: number) {
    const existingPost = await this.prisma.post.findUnique({
      where: { id },
    });

    if (!existingPost) {
      throw new NotFoundException('Post not found');
    }

    await this.prisma.post.delete({
      where: { id },
    });

    return { message: 'Post deleted successfully' };
  }
}
