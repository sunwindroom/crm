import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Request,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { Public } from '../auth/decorators/public.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @RequirePermissions('user_create')
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @RequirePermissions('user_view')
  async findAll(@Query() queryDto: QueryUserDto) {
    return this.userService.findAll(queryDto);
  }

  @Get('me')
  async getCurrentUser(@Request() req: any) {
    return req.user;
  }

  @Get('sales')
  @RequirePermissions('user_view')
  async getSalesUsers(@Query('keyword') keyword?: string) {
    return this.userService.getSalesUsers(keyword);
  }

  @Get('subordinates')
  async getSubordinates(@Request() req: any) {
    return this.userService.getSubordinates(req.user.id);
  }

  @Get('superior')
  async getSuperior(@Request() req: any) {
    return this.userService.getSuperior(req.user.id);
  }

  @Get(':id')
  @RequirePermissions('user_view')
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Put(':id')
  @RequirePermissions('user_edit')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @Patch(':id/status')
  @RequirePermissions('user_edit')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.userService.updateStatus(id, status as any);
  }

  @Post(':id/reset-password')
  @RequirePermissions('user_edit')
  async resetPassword(
    @Param('id') id: string,
    @Body('newPassword') newPassword: string,
  ) {
    await this.userService.resetPassword(id, newPassword);
    return { message: '密码重置成功' };
  }

  @Delete(':id')
  @RequirePermissions('user_delete')
  async remove(@Param('id') id: string) {
    await this.userService.remove(id);
    return { message: '删除成功' };
  }
}
