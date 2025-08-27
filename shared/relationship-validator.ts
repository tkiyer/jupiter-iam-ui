/**
 * 关联关系验证和冲突检测工具
 * 提供各种IAM关系的验证和冲突检测功能
 */

import {
  User,
  Role,
  Permission,
  ABACPolicy,
  PolicyRule,
  AttributeCondition,
} from "./iam";

// 验证结果接口
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  type:
    | "circular_dependency"
    | "conflicting_permissions"
    | "invalid_assignment"
    | "policy_conflict";
  message: string;
  entityIds: string[];
  severity: "low" | "medium" | "high" | "critical";
}

export interface ValidationWarning {
  type:
    | "redundant_assignment"
    | "over_privileged"
    | "under_privileged"
    | "policy_overlap";
  message: string;
  entityIds: string[];
  suggestion?: string;
}

// 冲突检测结果
export interface ConflictDetectionResult {
  conflicts: Conflict[];
  riskScore: number;
  recommendations: string[];
}

export interface Conflict {
  id: string;
  type: "role_conflict" | "permission_conflict" | "policy_conflict";
  description: string;
  involvedEntities: string[];
  severity: "low" | "medium" | "high" | "critical";
  resolution?: string;
}

export class RelationshipValidator {
  /**
   * 验证用户-角色分配
   */
  static validateUserRoleAssignment(
    userId: string,
    roleId: string,
    users: User[],
    roles: Role[],
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const user = users.find((u) => u.id === userId);
    const role = roles.find((r) => r.id === roleId);

    if (!user || !role) {
      errors.push({
        type: "invalid_assignment",
        message: "用户或角色不存在",
        entityIds: [userId, roleId],
        severity: "critical",
      });
      return { isValid: false, errors, warnings };
    }

    // 检查是否已存在该分配
    if (user.roles.includes(roleId)) {
      warnings.push({
        type: "redundant_assignment",
        message: "用户已分配该角色",
        entityIds: [userId, roleId],
        suggestion: "无需重复分配",
      });
    }

    // 检查角色冲突
    const conflictingRoles = this.findConflictingRoles(
      roleId,
      user.roles,
      roles,
    );
    if (conflictingRoles.length > 0) {
      errors.push({
        type: "conflicting_permissions",
        message: `角色 ${role.name} 与现有角色存在冲突`,
        entityIds: [roleId, ...conflictingRoles],
        severity: "high",
      });
    }

    // 检查循环依赖
    if (this.hasCircularDependency(roleId, roles)) {
      errors.push({
        type: "circular_dependency",
        message: "检测到角色循环依赖",
        entityIds: [roleId],
        severity: "critical",
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * 验证角色-权限分配
   */
  static validateRolePermissionAssignment(
    roleId: string,
    permissionIds: string[],
    roles: Role[],
    permissions: Permission[],
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const role = roles.find((r) => r.id === roleId);
    if (!role) {
      errors.push({
        type: "invalid_assignment",
        message: "角色不存在",
        entityIds: [roleId],
        severity: "critical",
      });
      return { isValid: false, errors, warnings };
    }

    // 验证权限是否存在
    const invalidPermissions = permissionIds.filter(
      (pid) => !permissions.find((p) => p.id === pid),
    );
    if (invalidPermissions.length > 0) {
      errors.push({
        type: "invalid_assignment",
        message: "部分权限不存在",
        entityIds: invalidPermissions,
        severity: "high",
      });
    }

    // 检查权限冲突
    const conflictingPermissions = this.findConflictingPermissions(
      permissionIds,
      permissions,
    );
    if (conflictingPermissions.length > 0) {
      errors.push({
        type: "conflicting_permissions",
        message: "权限之间存在冲突",
        entityIds: conflictingPermissions,
        severity: "medium",
      });
    }

    // 检查重复分配
    const existingPermissions = role.permissions;
    const duplicatePermissions = permissionIds.filter((pid) =>
      existingPermissions.includes(pid),
    );
    if (duplicatePermissions.length > 0) {
      warnings.push({
        type: "redundant_assignment",
        message: "部分权限已分配给该角色",
        entityIds: duplicatePermissions,
        suggestion: "移除重复权限",
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * 验证策略配置
   */
  static validatePolicyConfiguration(
    policy: ABACPolicy,
    existingPolicies: ABACPolicy[],
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // 检查策略名称冲突
    const nameConflict = existingPolicies.find(
      (p) => p.id !== policy.id && p.name === policy.name,
    );
    if (nameConflict) {
      errors.push({
        type: "invalid_assignment",
        message: "策略名称已存在",
        entityIds: [policy.id, nameConflict.id],
        severity: "medium",
      });
    }

    // 检查策略冲突
    const conflictingPolicies = this.findConflictingPolicies(
      policy,
      existingPolicies,
    );
    if (conflictingPolicies.length > 0) {
      errors.push({
        type: "policy_conflict",
        message: "策略与现有策略存在冲突",
        entityIds: [policy.id, ...conflictingPolicies.map((p) => p.id)],
        severity: "high",
      });
    }

    // 检查策略优先级
    if (policy.priority < 1 || policy.priority > 1000) {
      warnings.push({
        type: "over_privileged",
        message: "策略优先级超出推荐范围 (1-1000)",
        entityIds: [policy.id],
        suggestion: "调整优先级到合理范围",
      });
    }

    // 检查规则完整性
    if (!policy.rules || policy.rules.length === 0) {
      warnings.push({
        type: "under_privileged",
        message: "策略缺少具体规则",
        entityIds: [policy.id],
        suggestion: "添加具体的访问控制规则",
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * 检测系统整体冲突
   */
  static detectSystemConflicts(
    users: User[],
    roles: Role[],
    permissions: Permission[],
    policies: ABACPolicy[],
  ): ConflictDetectionResult {
    const conflicts: Conflict[] = [];

    // 检测角色冲突
    const roleConflicts = this.detectRoleConflicts(roles);
    conflicts.push(...roleConflicts);

    // 检测权限冲突
    const permissionConflicts = this.detectPermissionConflicts(
      permissions,
      roles,
    );
    conflicts.push(...permissionConflicts);

    // 检测策略冲突
    const policyConflicts = this.detectPolicyConflicts(policies);
    conflicts.push(...policyConflicts);

    // 计算风险分数
    const riskScore = this.calculateRiskScore(conflicts);

    // 生成建议
    const recommendations = this.generateRecommendations(conflicts);

    return {
      conflicts,
      riskScore,
      recommendations,
    };
  }

  // 私有辅助方法

  private static findConflictingRoles(
    roleId: string,
    existingRoles: string[],
    roles: Role[],
  ): string[] {
    const targetRole = roles.find((r) => r.id === roleId);
    if (!targetRole) return [];

    const conflicts: string[] = [];

    existingRoles.forEach((existingRoleId) => {
      const existingRole = roles.find((r) => r.id === existingRoleId);
      if (existingRole && this.areRolesConflicting(targetRole, existingRole)) {
        conflicts.push(existingRoleId);
      }
    });

    return conflicts;
  }

  private static areRolesConflicting(role1: Role, role2: Role): boolean {
    // 检查是否有互斥标记
    if (role1.name.includes("admin") && role2.name.includes("guest"))
      return true;
    if (role1.name.includes("read") && role2.name.includes("write"))
      return false; // 读写不冲突

    // 可以添加更多角色冲突逻辑
    return false;
  }

  private static hasCircularDependency(roleId: string, roles: Role[]): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (currentRoleId: string): boolean => {
      if (recursionStack.has(currentRoleId)) return true;
      if (visited.has(currentRoleId)) return false;

      visited.add(currentRoleId);
      recursionStack.add(currentRoleId);

      const currentRole = roles.find((r) => r.id === currentRoleId);
      if (currentRole?.parentRole) {
        if (dfs(currentRole.parentRole)) return true;
      }

      recursionStack.delete(currentRoleId);
      return false;
    };

    return dfs(roleId);
  }

  private static findConflictingPermissions(
    permissionIds: string[],
    permissions: Permission[],
  ): string[] {
    const conflicts: string[] = [];

    for (let i = 0; i < permissionIds.length; i++) {
      for (let j = i + 1; j < permissionIds.length; j++) {
        const perm1 = permissions.find((p) => p.id === permissionIds[i]);
        const perm2 = permissions.find((p) => p.id === permissionIds[j]);

        if (perm1 && perm2 && this.arePermissionsConflicting(perm1, perm2)) {
          conflicts.push(perm1.id, perm2.id);
        }
      }
    }

    return [...new Set(conflicts)];
  }

  private static arePermissionsConflicting(
    perm1: Permission,
    perm2: Permission,
  ): boolean {
    // 检查读写冲突（在某些特定资源上）
    if (
      perm1.scope === perm2.scope &&
      perm1.name.includes("delete") &&
      perm2.name.includes("read_only")
    ) {
      return true;
    }

    // 可以添加更多权限冲突逻辑
    return false;
  }

  private static findConflictingPolicies(
    policy: ABACPolicy,
    existingPolicies: ABACPolicy[],
  ): ABACPolicy[] {
    return existingPolicies.filter((existingPolicy) => {
      if (existingPolicy.id === policy.id) return false;

      // 检查优先级相同但���果相反的策略
      if (
        existingPolicy.priority === policy.priority &&
        existingPolicy.effect !== policy.effect
      ) {
        return this.havePolicyRuleOverlap(policy, existingPolicy);
      }

      return false;
    });
  }

  private static havePolicyRuleOverlap(
    policy1: ABACPolicy,
    policy2: ABACPolicy,
  ): boolean {
    // 简化的重叠检测逻辑
    return policy1.rules.some((rule1) =>
      policy2.rules.some((rule2) => this.doRulesOverlap(rule1, rule2)),
    );
  }

  private static doRulesOverlap(rule1: PolicyRule, rule2: PolicyRule): boolean {
    // 检查主体重叠
    const subjectOverlap = rule1.subject.some((s1) =>
      rule2.subject.some((s2) => this.doConditionsOverlap(s1, s2)),
    );

    // 检查资源重叠
    const resourceOverlap = rule1.resource.some((r1) =>
      rule2.resource.some((r2) => this.doConditionsOverlap(r1, r2)),
    );

    // 检查动作重叠
    const actionOverlap = rule1.action.some((a1) => rule2.action.includes(a1));

    return subjectOverlap && resourceOverlap && actionOverlap;
  }

  private static doConditionsOverlap(
    cond1: AttributeCondition,
    cond2: AttributeCondition,
  ): boolean {
    return (
      cond1.attribute === cond2.attribute &&
      cond1.operator === cond2.operator &&
      cond1.value === cond2.value
    );
  }

  private static detectRoleConflicts(roles: Role[]): Conflict[] {
    const conflicts: Conflict[] = [];

    // 检测循环依赖
    roles.forEach((role) => {
      if (this.hasCircularDependency(role.id, roles)) {
        conflicts.push({
          id: `role_circular_${role.id}`,
          type: "role_conflict",
          description: `角色 ${role.name} 存在循环依赖`,
          involvedEntities: [role.id],
          severity: "critical",
          resolution: "移除循环依赖路径",
        });
      }
    });

    return conflicts;
  }

  private static detectPermissionConflicts(
    permissions: Permission[],
    roles: Role[],
  ): Conflict[] {
    const conflicts: Conflict[] = [];

    // 检测角色内权限冲突
    roles.forEach((role) => {
      const rolePermissions = permissions.filter((p) =>
        role.permissions.includes(p.id),
      );
      for (let i = 0; i < rolePermissions.length; i++) {
        for (let j = i + 1; j < rolePermissions.length; j++) {
          if (
            this.arePermissionsConflicting(
              rolePermissions[i],
              rolePermissions[j],
            )
          ) {
            conflicts.push({
              id: `perm_conflict_${role.id}_${rolePermissions[i].id}_${rolePermissions[j].id}`,
              type: "permission_conflict",
              description: `角色 ${role.name} 中权限 ${rolePermissions[i].name} 与 ${rolePermissions[j].name} 冲突`,
              involvedEntities: [
                role.id,
                rolePermissions[i].id,
                rolePermissions[j].id,
              ],
              severity: "medium",
              resolution: "移除冲突的权限",
            });
          }
        }
      }
    });

    return conflicts;
  }

  private static detectPolicyConflicts(policies: ABACPolicy[]): Conflict[] {
    const conflicts: Conflict[] = [];

    for (let i = 0; i < policies.length; i++) {
      for (let j = i + 1; j < policies.length; j++) {
        if (
          policies[i].effect !== policies[j].effect &&
          this.havePolicyRuleOverlap(policies[i], policies[j])
        ) {
          conflicts.push({
            id: `policy_conflict_${policies[i].id}_${policies[j].id}`,
            type: "policy_conflict",
            description: `策略 ${policies[i].name} 与 ${policies[j].name} 存在冲突`,
            involvedEntities: [policies[i].id, policies[j].id],
            severity: "high",
            resolution: "调整策略优先级或修改规则条件",
          });
        }
      }
    }

    return conflicts;
  }

  private static calculateRiskScore(conflicts: Conflict[]): number {
    let score = 0;
    conflicts.forEach((conflict) => {
      switch (conflict.severity) {
        case "critical":
          score += 40;
          break;
        case "high":
          score += 25;
          break;
        case "medium":
          score += 15;
          break;
        case "low":
          score += 5;
          break;
      }
    });
    return Math.min(score, 100);
  }

  private static generateRecommendations(conflicts: Conflict[]): string[] {
    const recommendations: string[] = [];

    const criticalCount = conflicts.filter(
      (c) => c.severity === "critical",
    ).length;
    const highCount = conflicts.filter((c) => c.severity === "high").length;

    if (criticalCount > 0) {
      recommendations.push(`立即解决 ${criticalCount} 个严重冲突`);
    }

    if (highCount > 0) {
      recommendations.push(`优先处理 ${highCount} 个高风险冲突`);
    }

    if (conflicts.length > 10) {
      recommendations.push("考虑重新设计权限架构以减少冲突");
    }

    return recommendations;
  }
}
