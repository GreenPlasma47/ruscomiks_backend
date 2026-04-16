import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateComicDto,
  UpdateComicDto,
  CreateChapterDto,
  ComicsQueryDto,
} from './comics.dto';
import slugify from 'slugify';

const COMIC_SELECT = {
  id: true,
  title: true,
  author: true,
  slug: true,
  description: true,
  coverImage: true,
  status: true,
  viewCount: true,
  shareCount: true,
  createdAt: true,
  updatedAt: true,
  publisher: { select: { id: true, name: true, avatar: true } },
  genres: { include: { genre: true } },
  _count: { select: { favorites: true, comments: true, ratings: true } },
};

@Injectable()
export class ComicsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: ComicsQueryDto) {
    const { search, genre, sort = 'newest', page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      ...(search && {
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
        ],
      }),
      ...(genre && {
        genres: { some: { genre: { slug: genre } } },
      }),
    };

    const orderBy: any =
      sort === 'popular'
        ? { viewCount: 'desc' }
        : sort === 'oldest'
          ? { createdAt: 'asc' }
          : { createdAt: 'desc' };

    const [comics, total] = await Promise.all([
      this.prisma.comic.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: COMIC_SELECT,
      }),
      this.prisma.comic.count({ where }),
    ]);

    return { comics, total, page, pages: Math.ceil(total / limit) };
  }

  async findById(id: number) {
    const comic = await this.prisma.comic.findUnique({
      where: { id },
      include: {
        publisher: { select: { id: true, name: true, avatar: true } },
        genres: { include: { genre: true } },
        // Include chapters if needed, though usually not required for basic edit
      },
    });
    if (!comic) throw new NotFoundException('Comic not found');
    return comic;
  }

  async findBySlug(slug: string) {
    const comic = await this.prisma.comic.findUnique({
      where: { slug },
      include: {
        publisher: { select: { id: true, name: true, avatar: true } },
        genres: { include: { genre: true } },
        chapters: { 
        orderBy: { chapterNum: 'asc' },
        include: {
          pages: { orderBy: { pageNum: 'asc' } } // This fetches the pages for every chapter
        }
      },
        _count: { select: { favorites: true, comments: true, ratings: true } },
      },
    });
    if (!comic) throw new NotFoundException('Comic not found');

    // Increment view count (fire-and-forget)
    this.prisma.comic
      .update({ where: { id: comic.id }, data: { viewCount: { increment: 1 } } })
      .catch(() => {});

    return comic;
  }

  async create(dto: CreateComicDto, publisherId: number) {
    const slug =
      slugify(dto.title, { lower: true, strict: true }) + '-' + Date.now();

    return this.prisma.comic.create({
      data: {
        title: dto.title,
        author: dto.author,
        description: dto.description,
        coverImage: dto.coverImage,
        status: dto.status ?? 'ongoing',
        slug,
        publisherId,
        genres:
          dto.genreIds?.length
            ? { create: dto.genreIds.map((id) => ({ genreId: id })) }
            : undefined,
      },
      select: COMIC_SELECT,
    });
  }

  async update(id: number, dto: UpdateComicDto, userId: number, userRole: string) {
    const comic = await this.prisma.comic.findUnique({ where: { id } });
    if (!comic) throw new NotFoundException('Comic not found');

    if (userRole !== 'admin' && comic.publisherId !== userId) {
      throw new ForbiddenException('You do not own this comic');
    }

    // Re-create genres
    await this.prisma.comicGenre.deleteMany({ where: { comicId: id } });

    return this.prisma.comic.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.author && { author: dto.author }),
        ...(dto.description && { description: dto.description }),
        ...(dto.coverImage !== undefined && { coverImage: dto.coverImage }),
        ...(dto.status && { status: dto.status }),
        genres:
          dto.genreIds?.length
            ? { create: dto.genreIds.map((gid) => ({ genreId: gid })) }
            : undefined,
      },
      select: COMIC_SELECT,
    });
  }

  async remove(id: number) {
    const comic = await this.prisma.comic.findUnique({ where: { id } });
    if (!comic) throw new NotFoundException('Comic not found');
    await this.prisma.comic.delete({ where: { id } });
    return { message: 'Comic deleted' };
  }

  async addChapter(comicId: number, dto: CreateChapterDto, userId: number, userRole: string) {
    const comic = await this.prisma.comic.findUnique({ where: { id: comicId } });
    if (!comic) throw new NotFoundException('Comic not found');

    if (userRole !== 'admin' && comic.publisherId !== userId) {
      throw new ForbiddenException('You do not own this comic');
    }

    return this.prisma.chapter.create({
      data: {
        comicId,
        title: dto.title,
        chapterNum: dto.chapterNum,
        pages: dto.pages?.length
          ? { create: dto.pages.map((url, i) => ({ pageNum: i + 1, imageUrl: url })) }
          : undefined,
      },
      include: { pages: { orderBy: { pageNum: 'asc' } } },
    });
  }

  getChapters(comicId: number) {
    return this.prisma.chapter.findMany({
      where: { comicId },
      include: { pages: { orderBy: { pageNum: 'asc' } } },
      orderBy: { chapterNum: 'asc' },
    });
  }

  async updateChapter(
    chapterId: number,
    dto: CreateChapterDto,
    userId: number,
    userRole: string,
  ) {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { comic: true },
    });
    if (!chapter) throw new NotFoundException('Chapter not found');

    if (userRole !== 'admin' && chapter.comic.publisherId !== userId) {
      throw new ForbiddenException('You do not own this comic');
    }

    // Delete existing pages and recreate
    await this.prisma.page.deleteMany({ where: { chapterId } });

    return this.prisma.chapter.update({
      where: { id: chapterId },
      data: {
        title: dto.title,
        chapterNum: dto.chapterNum,
        pages: dto.pages?.length
          ? { create: dto.pages.map((url, i) => ({ pageNum: i + 1, imageUrl: url })) }
          : undefined,
      },
      include: { pages: { orderBy: { pageNum: 'asc' } } },
    });
  }

  async deleteChapter(chapterId: number, userId: number, userRole: string) {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { comic: true },
    });
    if (!chapter) throw new NotFoundException('Chapter not found');

    if (userRole !== 'admin' && chapter.comic.publisherId !== userId) {
      throw new ForbiddenException('You do not own this comic');
    }

    await this.prisma.chapter.delete({ where: { id: chapterId } });
    return { message: 'Chapter deleted' };
  }
}


// import {
//   Injectable,
//   NotFoundException,
//   ForbiddenException,
// } from '@nestjs/common';
// import { PrismaService } from '../prisma/prisma.service';
// import {
//   CreateComicDto,
//   UpdateComicDto,
//   CreateChapterDto,
//   ComicsQueryDto,
// } from './comics.dto';
// import slugify from 'slugify';

// const COMIC_SELECT = {
//   id: true,
//   title: true,
//   slug: true,
//   description: true,
//   coverImage: true,
//   status: true,
//   viewCount: true,
//   shareCount: true,
//   createdAt: true,
//   updatedAt: true,
//   publisher: { select: { id: true, name: true, avatar: true } },
//   genres: { include: { genre: true } },
//   _count: { select: { favorites: true, comments: true, ratings: true } },
// };

// @Injectable()
// export class ComicsService {
//   constructor(private prisma: PrismaService) {}

//   async findAll(query: ComicsQueryDto) {
//     const { search, genre, sort = 'newest', page = 1, limit = 20 } = query;
//     const skip = (page - 1) * limit;

//     const where: any = {
//       ...(search && {
//         OR: [
//           { title: { contains: search } },
//           { description: { contains: search } },
//         ],
//       }),
//       ...(genre && {
//         genres: { some: { genre: { slug: genre } } },
//       }),
//     };

//     const orderBy: any =
//       sort === 'popular'
//         ? { viewCount: 'desc' }
//         : sort === 'oldest'
//           ? { createdAt: 'asc' }
//           : { createdAt: 'desc' };

//     const [comics, total] = await Promise.all([
//       this.prisma.comic.findMany({
//         where,
//         orderBy,
//         skip,
//         take: limit,
//         select: COMIC_SELECT,
//       }),
//       this.prisma.comic.count({ where }),
//     ]);

//     return { comics, total, page, pages: Math.ceil(total / limit) };
//   }

//   async findBySlug(slug: string) {
//     const comic = await this.prisma.comic.findUnique({
//       where: { slug },
//       include: {
//         publisher: { select: { id: true, name: true, avatar: true } },
//         genres: { include: { genre: true } },
//         chapters: { orderBy: { chapterNum: 'asc' } },
//         _count: { select: { favorites: true, comments: true, ratings: true } },
//       },
//     });
//     if (!comic) throw new NotFoundException('Comic not found');

//     // Increment view count (fire-and-forget)
//     this.prisma.comic
//       .update({ where: { id: comic.id }, data: { viewCount: { increment: 1 } } })
//       .catch(() => {});

//     return comic;
//   }

//   async create(dto: CreateComicDto, publisherId: number) {
//     const slug =
//       slugify(dto.title, { lower: true, strict: true }) + '-' + Date.now();

//     return this.prisma.comic.create({
//       data: {
//         title: dto.title,
//         description: dto.description,
//         coverImage: dto.coverImage,
//         status: dto.status ?? 'ongoing',
//         slug,
//         publisherId,
//         genres:
//           dto.genreIds?.length
//             ? { create: dto.genreIds.map((id) => ({ genreId: id })) }
//             : undefined,
//       },
//       select: COMIC_SELECT,
//     });
//   }

//   async update(id: number, dto: UpdateComicDto, userId: number, userRole: string) {
//     const comic = await this.prisma.comic.findUnique({ where: { id } });
//     if (!comic) throw new NotFoundException('Comic not found');

//     if (userRole !== 'admin' && comic.publisherId !== userId) {
//       throw new ForbiddenException('You do not own this comic');
//     }

//     // Re-create genres
//     await this.prisma.comicGenre.deleteMany({ where: { comicId: id } });

//     return this.prisma.comic.update({
//       where: { id },
//       data: {
//         ...(dto.title && { title: dto.title }),
//         ...(dto.description && { description: dto.description }),
//         ...(dto.coverImage !== undefined && { coverImage: dto.coverImage }),
//         ...(dto.status && { status: dto.status }),
//         genres:
//           dto.genreIds?.length
//             ? { create: dto.genreIds.map((gid) => ({ genreId: gid })) }
//             : undefined,
//       },
//       select: COMIC_SELECT,
//     });
//   }

//   async remove(id: number) {
//     const comic = await this.prisma.comic.findUnique({ where: { id } });
//     if (!comic) throw new NotFoundException('Comic not found');
//     await this.prisma.comic.delete({ where: { id } });
//     return { message: 'Comic deleted' };
//   }

//   async addChapter(comicId: number, dto: CreateChapterDto, userId: number, userRole: string) {
//     const comic = await this.prisma.comic.findUnique({ where: { id: comicId } });
//     if (!comic) throw new NotFoundException('Comic not found');

//     if (userRole !== 'admin' && comic.publisherId !== userId) {
//       throw new ForbiddenException('You do not own this comic');
//     }

//     return this.prisma.chapter.create({
//       data: {
//         comicId,
//         title: dto.title,
//         chapterNum: dto.chapterNum,
//         pages: dto.pages?.length
//           ? { create: dto.pages.map((url, i) => ({ pageNum: i + 1, imageUrl: url })) }
//           : undefined,
//       },
//       include: { pages: { orderBy: { pageNum: 'asc' } } },
//     });
//   }

//   getChapters(comicId: number) {
//     return this.prisma.chapter.findMany({
//       where: { comicId },
//       include: { pages: { orderBy: { pageNum: 'asc' } } },
//       orderBy: { chapterNum: 'asc' },
//     });
//   }
// }