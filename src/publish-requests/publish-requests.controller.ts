import {
  Controller, Get, Post, Patch,
  Body, Param, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { PublishRequestsService } from './publish-requests.service';
import { CreatePublishRequestDto } from './publish-requests.dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('publish-requests')
export class PublishRequestsController {
  constructor(private publishRequestsService: PublishRequestsService) {}

  // Any logged-in user can submit a request
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreatePublishRequestDto, @CurrentUser() user: any) {
    return this.publishRequestsService.create(user.id, dto);
  }

  // Admin: view all requests
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findAll() {
    return this.publishRequestsService.findAll();
  }

  // Admin: approve
  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  approve(@Param('id', ParseIntPipe) id: number) {
    return this.publishRequestsService.approve(id);
  }

  // Admin: reject
  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  reject(@Param('id', ParseIntPipe) id: number) {
    return this.publishRequestsService.reject(id);
  }
}