import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { Permission } from './entities/role.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @RequirePermissions('role_view')
  async findAll() {
    return this.roleService.findAll();
  }

  @Get(':id')
  @RequirePermissions('role_view')
  async findOne(@Param('id') id: string) {
    return this.roleService.findOne(id);
  }

  @Get('code/:code')
  @RequirePermissions('role_view')
  async findByCode(@Param('code') code: string) {
    return this.roleService.findByCode(code);
  }

  @Post()
  @RequirePermissions('role_edit')
  async create(@Body() roleData: {
    name: string;
    code: string;
    description?: string;
    permissions: Permission[];
  }) {
    return this.roleService.create(roleData);
  }

  @Put(':id')
  @RequirePermissions('role_edit')
  async update(
    @Param('id') id: string,
    @Body() roleData: {
      name?: string;
      description?: string;
      permissions?: Permission[];
    },
  ) {
    return this.roleService.update(id, roleData);
  }

  @Delete(':id')
  @RequirePermissions('role_edit')
  async remove(@Param('id') id: string) {
    await this.roleService.remove(id);
    return { message: '删除成功' };
  }
}
