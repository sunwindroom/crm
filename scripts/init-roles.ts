import { NestFactory } from '@nestjs/core';
import { AppModule } from '../packages/backend/src/app.module';
import { RoleService } from '../packages/backend/src/modules/role/role.service';
import { Permission } from '../packages/backend/src/modules/role/entities/role.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const roleService = app.get(RoleService);

  const roles = [
    {
      name: '管理员',
      code: 'admin',
      description: '系统管理员，拥有所有权限',
      permissions: Object.values(Permission),
      isSystem: true,
    },
    {
      name: '总裁',
      code: 'ceo',
      description: '公司总裁，拥有大部分业务权限',
      permissions: [
        Permission.LEAD_CREATE,
        Permission.LEAD_VIEW,
        Permission.LEAD_EDIT,
        Permission.LEAD_DELETE,
        Permission.LEAD_ASSIGN,
        Permission.LEAD_CONVERT,
        Permission.CUSTOMER_CREATE,
        Permission.CUSTOMER_VIEW,
        Permission.CUSTOMER_EDIT,
        Permission.CUSTOMER_DELETE,
        Permission.PROJECT_CREATE,
        Permission.PROJECT_VIEW,
        Permission.PROJECT_EDIT,
        Permission.PROJECT_DELETE,
        Permission.CONTRACT_CREATE,
        Permission.CONTRACT_VIEW,
        Permission.CONTRACT_EDIT,
        Permission.CONTRACT_DELETE,
        Permission.PAYMENT_CREATE,
        Permission.PAYMENT_VIEW,
        Permission.PAYMENT_EDIT,
        Permission.PAYMENT_DELETE,
        Permission.USER_VIEW,
        Permission.REPORT_VIEW,
        Permission.DASHBOARD_VIEW,
      ],
      isSystem: true,
    },
    {
      name: '技术副总',
      code: 'cto',
      description: '技术负责人，负责项目管理',
      permissions: [
        Permission.LEAD_VIEW,
        Permission.CUSTOMER_VIEW,
        Permission.PROJECT_CREATE,
        Permission.PROJECT_VIEW,
        Permission.PROJECT_EDIT,
        Permission.PROJECT_DELETE,
        Permission.CONTRACT_VIEW,
        Permission.PAYMENT_VIEW,
        Permission.USER_VIEW,
        Permission.REPORT_VIEW,
        Permission.DASHBOARD_VIEW,
      ],
      isSystem: true,
    },
    {
      name: '营销副总',
      code: 'cmo',
      description: '营销负责人，负责销售管理',
      permissions: [
        Permission.LEAD_CREATE,
        Permission.LEAD_VIEW,
        Permission.LEAD_EDIT,
        Permission.LEAD_DELETE,
        Permission.LEAD_ASSIGN,
        Permission.LEAD_CONVERT,
        Permission.CUSTOMER_CREATE,
        Permission.CUSTOMER_VIEW,
        Permission.CUSTOMER_EDIT,
        Permission.CUSTOMER_DELETE,
        Permission.PROJECT_VIEW,
        Permission.CONTRACT_CREATE,
        Permission.CONTRACT_VIEW,
        Permission.CONTRACT_EDIT,
        Permission.PAYMENT_VIEW,
        Permission.USER_VIEW,
        Permission.REPORT_VIEW,
        Permission.DASHBOARD_VIEW,
      ],
      isSystem: true,
    },
    {
      name: '销售经理',
      code: 'sales_manager',
      description: '销售团队管理者',
      permissions: [
        Permission.LEAD_CREATE,
        Permission.LEAD_VIEW,
        Permission.LEAD_EDIT,
        Permission.LEAD_ASSIGN,
        Permission.LEAD_CONVERT,
        Permission.CUSTOMER_CREATE,
        Permission.CUSTOMER_VIEW,
        Permission.CUSTOMER_EDIT,
        Permission.PROJECT_VIEW,
        Permission.CONTRACT_VIEW,
        Permission.PAYMENT_VIEW,
        Permission.REPORT_VIEW,
        Permission.DASHBOARD_VIEW,
      ],
      isSystem: true,
    },
    {
      name: '销售',
      code: 'sales',
      description: '销售人员',
      permissions: [
        Permission.LEAD_CREATE,
        Permission.LEAD_VIEW,
        Permission.LEAD_EDIT,
        Permission.LEAD_CONVERT,
        Permission.CUSTOMER_CREATE,
        Permission.CUSTOMER_VIEW,
        Permission.CUSTOMER_EDIT,
        Permission.PROJECT_VIEW,
        Permission.CONTRACT_VIEW,
        Permission.PAYMENT_VIEW,
        Permission.REPORT_VIEW,
        Permission.DASHBOARD_VIEW,
      ],
      isSystem: true,
    },
    {
      name: '项目经理',
      code: 'project_manager',
      description: '项目管理者',
      permissions: [
        Permission.LEAD_VIEW,
        Permission.CUSTOMER_VIEW,
        Permission.PROJECT_CREATE,
        Permission.PROJECT_VIEW,
        Permission.PROJECT_EDIT,
        Permission.CONTRACT_VIEW,
        Permission.PAYMENT_VIEW,
        Permission.USER_VIEW,
        Permission.REPORT_VIEW,
        Permission.DASHBOARD_VIEW,
      ],
      isSystem: true,
    },
    {
      name: '商务',
      code: 'business',
      description: '商务人员',
      permissions: [
        Permission.LEAD_CREATE,
        Permission.LEAD_VIEW,
        Permission.LEAD_EDIT,
        Permission.LEAD_CONVERT,
        Permission.CUSTOMER_CREATE,
        Permission.CUSTOMER_VIEW,
        Permission.CUSTOMER_EDIT,
        Permission.PROJECT_VIEW,
        Permission.CONTRACT_VIEW,
        Permission.PAYMENT_VIEW,
        Permission.REPORT_VIEW,
        Permission.DASHBOARD_VIEW,
      ],
      isSystem: true,
    },
    {
      name: '财务',
      code: 'finance',
      description: '财务人员',
      permissions: [
        Permission.LEAD_VIEW,
        Permission.CUSTOMER_VIEW,
        Permission.PROJECT_VIEW,
        Permission.CONTRACT_CREATE,
        Permission.CONTRACT_VIEW,
        Permission.CONTRACT_EDIT,
        Permission.PAYMENT_CREATE,
        Permission.PAYMENT_VIEW,
        Permission.PAYMENT_EDIT,
        Permission.REPORT_VIEW,
        Permission.DASHBOARD_VIEW,
      ],
      isSystem: true,
    },
  ];

  for (const roleData of roles) {
    try {
      const existingRole = await roleService.findByCode(roleData.code);
      if (!existingRole) {
        await roleService.create(roleData);
        console.log(`✓ 创建角色: ${roleData.name}`);
      } else {
        console.log(`- 角色已存在: ${roleData.name}`);
      }
    } catch (error) {
      console.error(`✗ 创建角色失败: ${roleData.name}`, error.message);
    }
  }

  console.log('\n角色初始化完成！');
  await app.close();
}

bootstrap();
