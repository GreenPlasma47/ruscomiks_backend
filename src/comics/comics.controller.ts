import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ComicsService } from './comics.service';
import {
  CreateComicDto,
  UpdateComicDto,
  CreateChapterDto,
  ComicsQueryDto,
} from './comics.dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('comics')
export class ComicsController {
  constructor(private comicsService: ComicsService) {}

  @Get()
  findAll(@Query() query: ComicsQueryDto) {
    return this.comicsService.findAll(query);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.comicsService.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'publisher')
  create(@Body() dto: CreateComicDto, @CurrentUser() user: any) {
    return this.comicsService.create(dto, user.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'publisher')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateComicDto,
    @CurrentUser() user: any,
  ) {
    return this.comicsService.update(id, dto, user.id, user.role);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.comicsService.remove(id);
  }

  @Post(':id/chapters')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'publisher')
  addChapter(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateChapterDto,
    @CurrentUser() user: any,
  ) {
    return this.comicsService.addChapter(id, dto, user.id, user.role);
  }

  @Get('id/:id') // New route: /comics/id/2
  findOneById(@Param('id', ParseIntPipe) id: number) {
    return this.comicsService.findById(id);
  }

  @Get(':id/chapters')
  getChapters(@Param('id', ParseIntPipe) id: number) {
    return this.comicsService.getChapters(id);
  }

  @Put('chapters/:chapterId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'publisher')
  updateChapter(
    @Param('chapterId', ParseIntPipe) chapterId: number,
    @Body() dto: CreateChapterDto,
    @CurrentUser() user: any,
  ) {
    return this.comicsService.updateChapter(chapterId, dto, user.id, user.role);
  }

  @Delete('chapters/:chapterId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'publisher')
  deleteChapter(
    @Param('chapterId', ParseIntPipe) chapterId: number,
    @CurrentUser() user: any,
  ) {
    return this.comicsService.deleteChapter(chapterId, user.id, user.role);
  }
}


// import {
//   Controller,
//   Get,
//   Post,
//   Put,
//   Delete,
//   Body,
//   Param,
//   Query,
//   ParseIntPipe,
//   UseGuards,
// } from '@nestjs/common';
// import { ComicsService } from './comics.service';
// import {
//   CreateComicDto,
//   UpdateComicDto,
//   CreateChapterDto,
//   ComicsQueryDto,
// } from './comics.dto';
// import { JwtAuthGuard, RolesGuard } from '../auth/guards';
// import { Roles } from '../auth/roles.decorator';
// import { CurrentUser } from '../auth/current-user.decorator';

// @Controller('comics')
// export class ComicsController {
//   constructor(private comicsService: ComicsService) {}

//   @Get()
//   findAll(@Query() query: ComicsQueryDto) {
//     return this.comicsService.findAll(query);
//   }

//   @Get(':slug')
//   findOne(@Param('slug') slug: string) {
//     return this.comicsService.findBySlug(slug);
//   }

//   @Post()
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles('admin', 'publisher')
//   create(@Body() dto: CreateComicDto, @CurrentUser() user: any) {
//     return this.comicsService.create(dto, user.id);
//   }

//   @Put(':id')
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles('admin', 'publisher')
//   update(
//     @Param('id', ParseIntPipe) id: number,
//     @Body() dto: UpdateComicDto,
//     @CurrentUser() user: any,
//   ) {
//     return this.comicsService.update(id, dto, user.id, user.role);
//   }

//   @Delete(':id')
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles('admin')
//   remove(@Param('id', ParseIntPipe) id: number) {
//     return this.comicsService.remove(id);
//   }

//   @Post(':id/chapters')
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles('admin', 'publisher')
//   addChapter(
//     @Param('id', ParseIntPipe) id: number,
//     @Body() dto: CreateChapterDto,
//     @CurrentUser() user: any,
//   ) {
//     return this.comicsService.addChapter(id, dto, user.id, user.role);
//   }

//   @Get(':id/chapters')
//   getChapters(@Param('id', ParseIntPipe) id: number) {
//     return this.comicsService.getChapters(id);
//   }
// }