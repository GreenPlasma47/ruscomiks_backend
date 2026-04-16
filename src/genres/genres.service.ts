import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGenreDto, UpdateGenreDto } from './genres.dto';
import slugify from 'slugify';

@Injectable()
export class GenresService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.genre.findMany({ orderBy: { name: 'asc' } });
  }

  async create(dto: CreateGenreDto) {
    const slug = slugify(dto.name, { lower: true, strict: true });
    try {
      return await this.prisma.genre.create({ data: { name: dto.name, slug } });
    } catch {
      throw new ConflictException('Genre already exists');
    }
  }

  async update(id: number, dto: UpdateGenreDto) {
    await this.ensureExists(id);
    const slug = slugify(dto.name, { lower: true, strict: true });
    return this.prisma.genre.update({ where: { id }, data: { name: dto.name, slug } });
  }

  async remove(id: number) {
    await this.ensureExists(id);
    await this.prisma.genre.delete({ where: { id } });
    return { message: 'Genre deleted' };
  }

  private async ensureExists(id: number) {
    const genre = await this.prisma.genre.findUnique({ where: { id } });
    if (!genre) throw new NotFoundException('Genre not found');
  }
}