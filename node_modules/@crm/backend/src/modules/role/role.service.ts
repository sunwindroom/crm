import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role, Permission } from './entities/role.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async findAll(): Promise<Role[]> {
    return this.roleRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    return role;
  }

  async findByCode(code: string): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: { code },
    });
  }

  async create(roleData: {
    name: string;
    code: string;
    description?: string;
    permissions: Permission[];
  }): Promise<Role> {
    // 检查角色名称是否已存在
    const existingName = await this.roleRepository.findOne({
      where: { name: roleData.name },
    });

    if (existingName) {
      throw new ConflictException('角色名称已存在');
    }

    // 检查角色代码是否已存在
    const existingCode = await this.roleRepository.findOne({
      where: { code: roleData.code },
    });

    if (existingCode) {
      throw new ConflictException('角色代码已存在');
    }

    const role = this.roleRepository.create(roleData);
    return this.roleRepository.save(role);
  }

  async update(
    id: string,
    roleData: {
      name?: string;
      description?: string;
      permissions?: Permission[];
    },
  ): Promise<Role> {
    const role = await this.findOne(id);

    // 系统角色不允许修改
    if (role.isSystem) {
      throw new ConflictException('系统角色不允许修改');
    }

    // 检查角色名称是否已存在
    if (roleData.name && roleData.name !== role.name) {
      const existingName = await this.roleRepository.findOne({
        where: { name: roleData.name },
      });

      if (existingName) {
        throw new ConflictException('角色名称已存在');
      }
    }

    Object.assign(role, roleData);
    return this.roleRepository.save(role);
  }

  async remove(id: string): Promise<void> {
    const role = await this.findOne(id);

    // 系统角色不允许删除
    if (role.isSystem) {
      throw new ConflictException('系统角色不允许删除');
    }

    await this.roleRepository.remove(role);
  }

  async getPermissionsByRole(roleCode: string): Promise<Permission[]> {
    const role = await this.findByCode(roleCode);

    if (!role) {
      return [];
    }

    return role.permissions;
  }
}
