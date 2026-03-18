import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('未登录');
    }

    // 管理员拥有所有权限
    if (user.role === 'admin') {
      return true;
    }

    // 检查用户是否拥有所需权限
    const userPermissions = this.getUserPermissions(user.role);

    const hasPermission = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException('权限不足');
    }

    return true;
  }

  private getUserPermissions(role: string): string[] {
    const rolePermissions: Record<string, string[]> = {
      admin: [
        'lead_create', 'lead_view', 'lead_edit', 'lead_delete', 'lead_assign', 'lead_convert',
        'customer_create', 'customer_view', 'customer_edit', 'customer_delete',
        'project_create', 'project_view', 'project_edit', 'project_delete',
        'contract_create', 'contract_view', 'contract_edit', 'contract_delete',
        'payment_create', 'payment_view', 'payment_edit', 'payment_delete',
        'user_create', 'user_view', 'user_edit', 'user_delete',
        'role_view', 'role_edit',
        'report_view',
        'dashboard_view',
      ],
      ceo: [
        'lead_create', 'lead_view', 'lead_edit', 'lead_delete', 'lead_assign', 'lead_convert',
        'customer_create', 'customer_view', 'customer_edit', 'customer_delete',
        'project_create', 'project_view', 'project_edit', 'project_delete',
        'contract_create', 'contract_view', 'contract_edit', 'contract_delete',
        'payment_create', 'payment_view', 'payment_edit', 'payment_delete',
        'user_view',
        'report_view',
        'dashboard_view',
      ],
      cto: [
        'lead_view',
        'customer_view',
        'project_create', 'project_view', 'project_edit', 'project_delete',
        'contract_view',
        'payment_view',
        'user_view',
        'report_view',
        'dashboard_view',
      ],
      cmo: [
        'lead_create', 'lead_view', 'lead_edit', 'lead_delete', 'lead_assign', 'lead_convert',
        'customer_create', 'customer_view', 'customer_edit', 'customer_delete',
        'project_view',
        'contract_create', 'contract_view', 'contract_edit',
        'payment_view',
        'user_view',
        'report_view',
        'dashboard_view',
      ],
      sales_manager: [
        'lead_create', 'lead_view', 'lead_edit', 'lead_assign', 'lead_convert',
        'customer_create', 'customer_view', 'customer_edit',
        'project_view',
        'contract_view',
        'payment_view',
        'report_view',
        'dashboard_view',
      ],
      sales: [
        'lead_create', 'lead_view', 'lead_edit', 'lead_convert',
        'customer_create', 'customer_view', 'customer_edit',
        'project_view',
        'contract_view',
        'payment_view',
        'report_view',
        'dashboard_view',
      ],
      project_manager: [
        'lead_view',
        'customer_view',
        'project_create', 'project_view', 'project_edit',
        'contract_view',
        'payment_view',
        'user_view',
        'report_view',
        'dashboard_view',
      ],
      business: [
        'lead_create', 'lead_view', 'lead_edit', 'lead_convert',
        'customer_create', 'customer_view', 'customer_edit',
        'project_view',
        'contract_view',
        'payment_view',
        'report_view',
        'dashboard_view',
      ],
      finance: [
        'lead_view',
        'customer_view',
        'project_view',
        'contract_create', 'contract_view', 'contract_edit',
        'payment_create', 'payment_view', 'payment_edit',
        'report_view',
        'dashboard_view',
      ],
    };

    return rolePermissions[role] || [];
  }
}
