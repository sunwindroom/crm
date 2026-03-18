import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, ProjectStatus } from './entities/project.entity';
import { Milestone, MilestoneStatus } from './entities/milestone.entity';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Milestone)
    private milestoneRepository: Repository<Milestone>,
  ) {}

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    const project = this.projectRepository.create(createProjectDto);
    return this.projectRepository.save(project);
  }

  async findAll(query: any): Promise<{ items: Project[]; total: number }> {
    const {
      page = 1,
      pageSize = 10,
      type,
      status,
      manager,
      keyword,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const queryBuilder = this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.customer', 'customer')
      .leftJoinAndSelect('project.managerUser', 'user');

    if (type) {
      queryBuilder.andWhere('project.type = :type', { type });
    }

    if (status) {
      queryBuilder.andWhere('project.status = :status', { status });
    }

    if (manager) {
      queryBuilder.andWhere('project.manager = :manager', { manager });
    }

    if (keyword) {
      queryBuilder.andWhere('project.name LIKE :keyword', {
        keyword: `%${keyword}%`,
      });
    }

    queryBuilder
      .orderBy(`project.${sortBy}`, sortOrder)
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [items, total] = await queryBuilder.getManyAndCount();

    return { items, total };
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['customer', 'managerUser', 'milestones', 'milestones.assigneeUser'],
    });

    if (!project) {
      throw new NotFoundException('项目不存在');
    }

    return project;
  }

  async update(
    id: string,
    updateProjectDto: Partial<CreateProjectDto>,
  ): Promise<Project> {
    const project = await this.findOne(id);
    Object.assign(project, updateProjectDto);
    return this.projectRepository.save(project);
  }

  async remove(id: string): Promise<void> {
    const project = await this.findOne(id);
    await this.projectRepository.remove(project);
  }

  async updateStatus(id: string, status: ProjectStatus): Promise<Project> {
    const project = await this.findOne(id);
    project.status = status;
    return this.projectRepository.save(project);
  }

  // 里程碑管理
  async addMilestone(
    projectId: string,
    milestoneData: Partial<Milestone>,
  ): Promise<Milestone> {
    const project = await this.findOne(projectId);

    const milestone = this.milestoneRepository.create({
      ...milestoneData,
      projectId: project.id,
    });

    return this.milestoneRepository.save(milestone);
  }

  async getMilestones(projectId: string): Promise<Milestone[]> {
    return this.milestoneRepository.find({
      where: { projectId },
      relations: ['assigneeUser'],
      order: { plannedDate: 'ASC' },
    });
  }

  async completeMilestone(milestoneId: string): Promise<Milestone> {
    const milestone = await this.milestoneRepository.findOne({
      where: { id: milestoneId },
      relations: ['project'],
    });

    if (!milestone) {
      throw new NotFoundException('里程碑不存在');
    }

    // 检查前置条件
    if (milestone.dependencies && milestone.dependencies.length > 0) {
      const prerequisites = await this.milestoneRepository.findByIds(
        milestone.dependencies,
      );

      const incomplete = prerequisites.filter(
        (m) => m.status !== MilestoneStatus.COMPLETED,
      );

      if (incomplete.length > 0) {
        throw new BadRequestException(
          `前置里程碑尚未完成: ${incomplete.map((m) => m.name).join(', ')}`,
        );
      }
    }

    milestone.status = MilestoneStatus.COMPLETED;
    milestone.actualDate = new Date();
    await this.milestoneRepository.save(milestone);

    // 检查项目是否完成
    await this.checkProjectCompletion(milestone.projectId);

    return milestone;
  }

  private async checkProjectCompletion(projectId: string): Promise<void> {
    const milestones = await this.milestoneRepository.find({
      where: { projectId },
    });

    const allCompleted = milestones.every(
      (m) => m.status === MilestoneStatus.COMPLETED,
    );

    if (allCompleted && milestones.length > 0) {
      await this.projectRepository.update(projectId, {
        status: ProjectStatus.COMPLETED,
      });
    }
  }
}
