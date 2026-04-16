import {
  Controller, Get, Post, Put, Delete,
  Body, Param, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { CarouselService } from './carousel.service';
import { CreateCarouselDto, UpdateCarouselDto } from './carousel.dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles } from '../auth/roles.decorator';

@Controller('carousel')
export class CarouselController {
  constructor(private carouselService: CarouselService) {}

  // Public: active items only
  @Get()
  findActive() {
    return this.carouselService.findActive();
  }

  // Admin: all items including inactive
  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findAll() {
    return this.carouselService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() dto: CreateCarouselDto) {
    return this.carouselService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCarouselDto) {
    return this.carouselService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.carouselService.remove(id);
  }
}