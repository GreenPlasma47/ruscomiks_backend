import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCarouselDto, UpdateCarouselDto } from './carousel.dto';

@Injectable()
export class CarouselService {
  constructor(private prisma: PrismaService) {}

  // Public — only active items
  findActive() {
    return this.prisma.carousel.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  // Admin — all items
  findAll() {
    return this.prisma.carousel.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  create(dto: CreateCarouselDto) {
    return this.prisma.carousel.create({ data: dto });
  }

  async update(id: number, dto: UpdateCarouselDto) {
    await this.ensureExists(id);
    return this.prisma.carousel.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.ensureExists(id);
    await this.prisma.carousel.delete({ where: { id } });
    return { message: 'Carousel item deleted' };
  }

  private async ensureExists(id: number) {
    const item = await this.prisma.carousel.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Carousel item not found');
  }
}