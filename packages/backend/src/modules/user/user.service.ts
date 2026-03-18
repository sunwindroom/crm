import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole, UserStatus } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // 检查用户名是否已存在
    const existingUser = await this.userRepository.findOne({
      where: { username: createUserDto.username },
    });

    if (existingUser) {
      throw new ConflictException('用户名已存在');
    }

    // 检查手机号是否已存在
    const existingPhone = await this.userRepository.findOne({
      where: { phone: createUserDto.phone },
    });

    if (existingPhone) {
      throw new ConflictException('手机号已被注册');
    }

    // 检查邮箱是否已存在
    if (createUserDto.email) {
      const existingEmail = await this.userRepository.findOne({
        where: { email: createUserDto.email },
      });

      if (existingEmail) {
        throw new ConflictException('邮箱已被注册');
      }
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.userRepository.save(user);
  }

  async findAll(queryDto: QueryUserDto): Promise<{ users: User[]; total: number }> {
    const { keyword, role, status, page = 1, pageSize = 10, sortBy = 'createdAt', sortOrder = 'DESC' } = queryDto;

    const options: FindManyOptions<User> = {
      select: [
        'id',
        'username',
        'name',
        'phone',
        'email',
        'department',
        'position',
        'avatar',
        'role',
        'status',
        'superiorId',
        'createdAt',
        'updatedAt',
      ],
      where: {},
      order: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    };

    // 关键词搜索
    if (keyword) {
      options.where = [
        { name: Like(`%${keyword}%`) },
        { username: Like(`%${keyword}%`) },
        { phone: Like(`%${keyword}%`) },
        { email: Like(`%${keyword}%`) },
      ];
    }

    // 角色筛选
    if (role) {
      if (Array.isArray(options.where)) {
        options.where = options.where.map(w => ({ ...w, role }));
      } else {
        options.where = { ...options.where, role };
      }
    }

    // 状态筛选
    if (status) {
      if (Array.isArray(options.where)) {
        options.where = options.where.map(w => ({ ...w, status }));
      } else {
        options.where = { ...options.where, status };
      }
    }

    const [users, total] = await this.userRepository.findAndCount(options);

    // 获取上级名称
    const userIds = users.map(u => u.superiorId).filter(Boolean) as string[];
    const superiors = userIds.length > 0 ? await this.userRepository.find({
      where: userIds.map(id => ({ id })),
      select: ['id', 'name']
    }) : [];

    const superiorMap = new Map(superiors.map(s => [s.id, s.name]));

    return {
      users: users.map(user => ({
        ...user,
        superiorName: user.superiorId ? superiorMap.get(user.superiorId) : undefined,
      })),
      total,
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: [
        'id',
        'username',
        'name',
        'phone',
        'email',
        'department',
        'position',
        'avatar',
        'role',
        'status',
        'superiorId',
        'createdAt',
        'updatedAt',
      ],
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 获取上级名称
    if (user.superiorId) {
      const superior = await this.userRepository.findOne({
        where: { id: user.superiorId },
        select: ['id', 'name']
      });
      return {
        ...user,
        superiorName: superior?.name,
      };
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 检查用户名是否唯一
    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUser = await this.userRepository.findOne({
        where: { username: updateUserDto.username },
      });

      if (existingUser) {
        throw new ConflictException('用户名已存在');
      }
    }

    // 检查手机号是否唯一
    if (updateUserDto.phone && updateUserDto.phone !== user.phone) {
      const existingPhone = await this.userRepository.findOne({
        where: { phone: updateUserDto.phone },
      });

      if (existingPhone) {
        throw new ConflictException('手机号已被注册');
      }
    }

    // 检查邮箱是否唯一
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingEmail = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (existingEmail) {
        throw new ConflictException('邮箱已被注册');
      }
    }

    // 加密密码
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    await this.userRepository.remove(user);
  }

  async resetPassword(id: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await this.userRepository.save(user);
  }

  async updateStatus(id: string, status: UserStatus): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    user.status = status;
    return this.userRepository.save(user);
  }

  async getSalesUsers(keyword?: string): Promise<User[]> {
    const options: FindManyOptions<User> = {
      where: { role: UserRole.SALES },
      select: ['id', 'username', 'name', 'phone', 'email', 'department', 'position'],
    };

    if (keyword) {
      options.where = [
        { name: Like(`%${keyword}%`), role: UserRole.SALES },
        { username: Like(`%${keyword}%`), role: UserRole.SALES },
      ];
    }

    return this.userRepository.find(options);
  }

  async getSubordinates(superiorId: string): Promise<User[]> {
    return this.userRepository.find({
      where: { superiorId },
      select: ['id', 'username', 'name', 'phone', 'email', 'department', 'position', 'role', 'status'],
    });
  }

  async getSuperior(userId: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['superiorId'],
    });

    if (!user || !user.superiorId) {
      return null;
    }

    return this.userRepository.findOne({
      where: { id: user.superiorId },
      select: ['id', 'username', 'name', 'phone', 'email', 'department', 'position', 'role'],
    });
  }
}
