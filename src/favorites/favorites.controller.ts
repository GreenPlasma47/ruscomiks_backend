import {
  Controller, Get, Post, Delete,
  Param, Query, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @Get()
  findAll(@CurrentUser() user: any, @Query('sort') sort?: string) {
    return this.favoritesService.findAll(user.id, sort);
  }

  @Post(':comicId')
  add(@Param('comicId', ParseIntPipe) comicId: number, @CurrentUser() user: any) {
    return this.favoritesService.add(user.id, comicId);
  }

  @Delete(':comicId')
  remove(@Param('comicId', ParseIntPipe) comicId: number, @CurrentUser() user: any) {
    return this.favoritesService.remove(user.id, comicId);
  }
}