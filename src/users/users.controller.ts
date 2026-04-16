import { Controller, Get, Patch, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  findMe(@CurrentUser() user: any) {
    return this.usersService.findMe(user.id);
  }

  @Patch(':id/promote')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  promote(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.promote(id);
  }

  @Patch(':id/demote')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  demote(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.demote(id);
  }
}