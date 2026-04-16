import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, avatar: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findMe(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, avatar: true, createdAt: true },
    });
  }

  async promote(id: number) {
    await this.ensureExists(id);
    return this.prisma.user.update({
      where: { id },
      data: { role: 'publisher' },
      select: { id: true, name: true, email: true, role: true },
    });
  }

  async demote(id: number) {
    await this.ensureExists(id);
    return this.prisma.user.update({
      where: { id },
      data: { role: 'reader' },
      select: { id: true, name: true, email: true, role: true },
    });
  }

  private async ensureExists(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
  }
}