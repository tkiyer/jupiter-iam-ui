import { RequestHandler } from "express";
import { ABACPolicy } from "@shared/iam";

// Enhanced business-oriented policies that demonstrate RBAC+ABAC integration
const businessPolicies: ABACPolicy[] = [
  {
    id: "bpol-expense-approval-001",
    name: "费用审批分级策略",
    description:
      "基于用户角色和费用金额的分级审批策略，体现RBAC基础权限+ABAC动态条件",
    rules: [
      {
        subject: [
          { attribute: "user_roles", operator: "in", value: ["employee"] },
          {
            attribute: "department",
            operator: "equals",
            value: "${resource.department}",
          },
        ],
        resource: [
          { attribute: "type", operator: "equals", value: "expense_request" },
          { attribute: "amount", operator: "less_than", value: 1000 },
        ],
        action: ["submit", "edit"],
        environment: [
          { attribute: "business_hours", operator: "equals", value: true },
        ],
      },
    ],
    effect: "allow",
    priority: 100,
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "bpol-expense-approval-002",
    name: "部门经理审批策略",
    description:
      "部门经理可审批本部门5万以下费用，展示角色权限与业务上下文结合",
    rules: [
      {
        subject: [
          {
            attribute: "user_roles",
            operator: "in",
            value: ["department_manager"],
          },
          {
            attribute: "department",
            operator: "equals",
            value: "${resource.expense_department}",
          },
          {
            attribute: "employment_status",
            operator: "equals",
            value: "active",
          },
        ],
        resource: [
          { attribute: "type", operator: "equals", value: "expense_request" },
          { attribute: "amount", operator: "less_than", value: 50000 },
          {
            attribute: "status",
            operator: "equals",
            value: "pending_approval",
          },
        ],
        action: ["approve", "reject", "request_clarification"],
        environment: [
          { attribute: "time", operator: "greater_than", value: "09:00" },
          { attribute: "time", operator: "less_than", value: "18:00" },
        ],
      },
    ],
    effect: "allow",
    priority: 150,
    status: "active",
    createdAt: "2024-01-02T00:00:00Z",
  },
  {
    id: "bpol-customer-data-region",
    name: "区域化客户数据访问策略",
    description: "销售人员只能访问负责区域的客户数据，结合角色与地理位置属性",
    rules: [
      {
        subject: [
          {
            attribute: "user_roles",
            operator: "in",
            value: ["sales_rep", "sales_manager"],
          },
          {
            attribute: "assigned_region",
            operator: "equals",
            value: "${resource.customer_region}",
          },
          {
            attribute: "sales_certification",
            operator: "equals",
            value: "valid",
          },
        ],
        resource: [
          { attribute: "type", operator: "equals", value: "customer_data" },
          {
            attribute: "data_classification",
            operator: "not_equals",
            value: "highly_confidential",
          },
        ],
        action: ["read", "update_notes", "schedule_meeting"],
        environment: [
          {
            attribute: "access_location",
            operator: "in",
            value: ["office", "authorized_remote"],
          },
          { attribute: "vpn_connected", operator: "equals", value: true },
        ],
      },
    ],
    effect: "allow",
    priority: 120,
    status: "active",
    createdAt: "2024-01-03T00:00:00Z",
  },
  {
    id: "bpol-hr-salary-restriction",
    name: "HR薪资信息访问限制策略",
    description: "薪资信息只对HR经理以上级别开放，体现敏感数据的分级保护",
    rules: [
      {
        subject: [
          { attribute: "user_roles", operator: "in", value: ["hr_specialist"] },
          { attribute: "clearance_level", operator: "less_than", value: 3 },
        ],
        resource: [
          { attribute: "type", operator: "equals", value: "employee_data" },
          {
            attribute: "contains_salary_info",
            operator: "equals",
            value: true,
          },
        ],
        action: ["read", "export", "print"],
      },
    ],
    effect: "deny",
    priority: 200,
    status: "active",
    createdAt: "2024-01-04T00:00:00Z",
  },
  {
    id: "bpol-production-deploy-window",
    name: "生产环境部署时间窗口策略",
    description: "生产部署只在维护窗口进行，结合角色权限与时间约束",
    rules: [
      {
        subject: [
          {
            attribute: "user_roles",
            operator: "in",
            value: ["devops_engineer", "senior_engineer"],
          },
          {
            attribute: "deployment_certification",
            operator: "equals",
            value: "current",
          },
          { attribute: "on_call_duty", operator: "equals", value: true },
        ],
        resource: [
          { attribute: "environment", operator: "equals", value: "production" },
          {
            attribute: "change_risk_level",
            operator: "in",
            value: ["low", "medium"],
          },
        ],
        action: ["deploy", "rollback", "configure"],
        environment: [
          { attribute: "maintenance_window", operator: "equals", value: true },
          { attribute: "change_freeze", operator: "equals", value: false },
          { attribute: "approval_obtained", operator: "equals", value: true },
        ],
      },
    ],
    effect: "allow",
    priority: 180,
    status: "active",
    createdAt: "2024-01-05T00:00:00Z",
  },
  {
    id: "bpol-emergency-access",
    name: "紧急情况特殊授权策略",
    description: "紧急情况下的临时权限提升，展示动态权限调整",
    rules: [
      {
        subject: [
          {
            attribute: "user_roles",
            operator: "in",
            value: ["manager", "senior_staff"],
          },
          { attribute: "emergency_contact", operator: "equals", value: true },
        ],
        resource: [
          {
            attribute: "emergency_access_required",
            operator: "equals",
            value: true,
          },
        ],
        action: ["emergency_override", "temporary_escalation"],
        environment: [
          {
            attribute: "incident_level",
            operator: "in",
            value: ["critical", "high"],
          },
          { attribute: "emergency_declared", operator: "equals", value: true },
          {
            attribute: "security_officer_notified",
            operator: "equals",
            value: true,
          },
        ],
      },
    ],
    effect: "allow",
    priority: 250,
    status: "active",
    createdAt: "2024-01-06T00:00:00Z",
  },
  {
    id: "bpol-financial-quarterly-reports",
    name: "财务季度报表访问策略",
    description: "财务报表访问基于角色层级和报表类型的细分控制",
    rules: [
      {
        subject: [
          {
            attribute: "user_roles",
            operator: "in",
            value: ["finance_manager", "cfo", "ceo"],
          },
          {
            attribute: "department",
            operator: "in",
            value: ["finance", "executive"],
          },
          {
            attribute: "financial_clearance",
            operator: "greater_than",
            value: 2,
          },
        ],
        resource: [
          { attribute: "type", operator: "equals", value: "financial_report" },
          {
            attribute: "report_category",
            operator: "in",
            value: ["quarterly", "annual"],
          },
          {
            attribute: "confidentiality_level",
            operator: "in",
            value: ["confidential", "restricted"],
          },
        ],
        action: ["read", "analyze", "share_with_board"],
        environment: [
          {
            attribute: "network_location",
            operator: "equals",
            value: "corporate",
          },
          {
            attribute: "device_compliance",
            operator: "equals",
            value: "compliant",
          },
        ],
      },
    ],
    effect: "allow",
    priority: 160,
    status: "active",
    createdAt: "2024-01-07T00:00:00Z",
  },
  {
    id: "bpol-contractor-data-limit",
    name: "外包人员数据访问限制策略",
    description: "外包人员受限访问敏感数据，体现基于雇佣类型的差异化控制",
    rules: [
      {
        subject: [
          {
            attribute: "employment_type",
            operator: "equals",
            value: "contractor",
          },
          {
            attribute: "contract_end_date",
            operator: "greater_than",
            value: "${current_date}",
          },
        ],
        resource: [
          {
            attribute: "data_classification",
            operator: "in",
            value: ["sensitive", "confidential"],
          },
          { attribute: "contains_pii", operator: "equals", value: true },
        ],
        action: ["read", "download", "export", "print"],
      },
    ],
    effect: "deny",
    priority: 190,
    status: "active",
    createdAt: "2024-01-08T00:00:00Z",
  },
  {
    id: "bpol-weekend-admin-lock",
    name: "周末管理操作限制策略",
    description: "周末限制高风险管理操作，降低非工作时间的安全风险",
    rules: [
      {
        subject: [
          {
            attribute: "user_roles",
            operator: "in",
            value: ["admin", "system_admin"],
          },
        ],
        resource: [
          {
            attribute: "operation_risk",
            operator: "in",
            value: ["high", "critical"],
          },
        ],
        action: [
          "delete_user",
          "modify_permissions",
          "system_shutdown",
          "data_purge",
        ],
        environment: [
          {
            attribute: "day_of_week",
            operator: "in",
            value: ["saturday", "sunday"],
          },
          {
            attribute: "emergency_override",
            operator: "not_equals",
            value: true,
          },
        ],
      },
    ],
    effect: "deny",
    priority: 170,
    status: "active",
    createdAt: "2024-01-09T00:00:00Z",
  },
  {
    id: "bpol-cross-department-approval",
    name: "跨部门数据访问审批策略",
    description: "跨部门数据访问需要额外审批，体现组织边界控制",
    rules: [
      {
        subject: [
          {
            attribute: "department",
            operator: "not_equals",
            value: "${resource.data_owner_department}",
          },
          {
            attribute: "cross_department_approval",
            operator: "equals",
            value: true,
          },
        ],
        resource: [
          {
            attribute: "department_restricted",
            operator: "equals",
            value: true,
          },
          { attribute: "data_sensitivity", operator: "greater_than", value: 2 },
        ],
        action: ["read", "access"],
        environment: [
          {
            attribute: "approval_valid_until",
            operator: "greater_than",
            value: "${current_timestamp}",
          },
          {
            attribute: "approver_department",
            operator: "equals",
            value: "${resource.data_owner_department}",
          },
        ],
      },
    ],
    effect: "allow",
    priority: 140,
    status: "active",
    createdAt: "2024-01-10T00:00:00Z",
  },
];

// Mock business context templates for policy testing
const businessContextTemplates = {
  expense_approval: {
    subject: {
      user_roles: ["employee", "department_manager", "finance_manager"],
      department: "IT",
      employment_status: "active",
      employee_level: 3,
    },
    resource: {
      type: "expense_request",
      amount: 25000,
      expense_department: "IT",
      status: "pending_approval",
      category: "equipment",
    },
    environment: {
      time: "14:30",
      business_hours: true,
      location: "office",
      day_of_week: "tuesday",
    },
  },
  customer_access: {
    subject: {
      user_roles: ["sales_rep"],
      assigned_region: "east_china",
      sales_certification: "valid",
      performance_rating: "excellent",
    },
    resource: {
      type: "customer_data",
      customer_region: "east_china",
      data_classification: "confidential",
      customer_tier: "premium",
    },
    environment: {
      access_location: "office",
      vpn_connected: true,
      device_type: "corporate_laptop",
    },
  },
  hr_salary_access: {
    subject: {
      user_roles: ["hr_specialist"],
      clearance_level: 2,
      department: "human_resources",
      tenure_years: 3,
    },
    resource: {
      type: "employee_data",
      contains_salary_info: true,
      employee_level: "manager",
      data_sensitivity: "high",
    },
    environment: {
      access_purpose: "performance_review",
      manager_approval: false,
      audit_required: true,
    },
  },
  production_deployment: {
    subject: {
      user_roles: ["devops_engineer"],
      deployment_certification: "current",
      on_call_duty: true,
      security_clearance: "high",
    },
    resource: {
      environment: "production",
      change_risk_level: "medium",
      system_criticality: "high",
      deployment_type: "hotfix",
    },
    environment: {
      maintenance_window: true,
      change_freeze: false,
      approval_obtained: true,
      rollback_plan: "prepared",
    },
  },
};

// Business rules evaluation engine
const businessRulesEngine = {
  // 费用审批业务规则
  expenseApprovalRules: {
    getRequiredApprover: (amount: number, department: string) => {
      if (amount < 1000) return "self_approval";
      if (amount < 50000) return "department_manager";
      if (amount < 100000) return "finance_manager";
      return "ceo";
    },

    validateBusinessHours: (time: string) => {
      const hour = parseInt(time.split(":")[0]);
      return hour >= 9 && hour <= 18;
    },

    checkDepartmentMatch: (
      userDepartment: string,
      expenseDepartment: string,
    ) => {
      return userDepartment === expenseDepartment;
    },
  },

  // 客户数据访问业务规则
  customerAccessRules: {
    validateRegionAccess: (userRegion: string, customerRegion: string) => {
      return userRegion === customerRegion;
    },

    checkDataClassificationAccess: (
      userRole: string,
      dataClassification: string,
    ) => {
      const accessMatrix = {
        sales_rep: ["public", "internal"],
        sales_manager: ["public", "internal", "confidential"],
        sales_director: ["public", "internal", "confidential", "restricted"],
      };
      return accessMatrix[userRole]?.includes(dataClassification) || false;
    },
  },

  // HR数据访问业务规则
  hrAccessRules: {
    getSalaryAccessLevel: (role: string, clearanceLevel: number) => {
      if (role === "hr_manager" && clearanceLevel >= 3) return "full";
      if (role === "hr_specialist" && clearanceLevel >= 2) return "limited";
      return "none";
    },

    validateCrossDepartmentAccess: (
      userDept: string,
      targetDept: string,
      approvalRequired: boolean,
    ) => {
      if (userDept === targetDept) return true;
      return approvalRequired;
    },
  },
};

// GET /api/business-policies - Get business-oriented policies
export const handleGetBusinessPolicies: RequestHandler = (req, res) => {
  try {
    const { category, complexity, integration_type } = req.query;

    let filteredPolicies = [...businessPolicies];

    // Filter by category
    if (category && typeof category === "string") {
      filteredPolicies = filteredPolicies.filter((policy) =>
        policy.name.toLowerCase().includes(category.toLowerCase()),
      );
    }

    // Add metadata about RBAC+ABAC integration
    const enhancedPolicies = filteredPolicies.map((policy) => ({
      ...policy,
      integration_analysis: analyzeRBACandABACIntegration(policy),
      business_context: getBusinessContext(policy.id),
      complexity_score: calculateComplexityScore(policy),
    }));

    res.json({
      policies: enhancedPolicies,
      total: enhancedPolicies.length,
      integration_summary: generateIntegrationSummary(enhancedPolicies),
    });
  } catch (error) {
    console.error("Error fetching business policies:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/business-policies/test-scenario - Test business scenario
export const handleTestBusinessScenario: RequestHandler = (req, res) => {
  try {
    const {
      scenario_type,
      user_context,
      resource_context,
      action,
      policies_to_test,
    } = req.body;

    if (!scenario_type || !user_context || !resource_context || !action) {
      return res
        .status(400)
        .json({ error: "Missing required scenario parameters" });
    }

    // Get template or use provided context
    const testContext = businessContextTemplates[scenario_type] || {
      subject: user_context,
      resource: resource_context,
      environment: req.body.environment_context || {},
    };

    // Find applicable policies
    const applicablePolicies =
      policies_to_test?.length > 0
        ? businessPolicies.filter((p) => policies_to_test.includes(p.id))
        : businessPolicies.filter((p) => p.status === "active");

    // Evaluate each policy
    const evaluationResults = applicablePolicies.map((policy) => {
      const rbacResult = evaluateRBACComponent(policy, testContext, action);
      const abacResult = evaluateABACComponent(policy, testContext, action);
      const businessRulesResult = evaluateBusinessRules(
        policy,
        testContext,
        action,
      );

      return {
        policyId: policy.id,
        policyName: policy.name,
        effect: policy.effect,
        priority: policy.priority,
        rbac_evaluation: rbacResult,
        abac_evaluation: abacResult,
        business_rules_evaluation: businessRulesResult,
        final_decision: combinePolicyResults(
          rbacResult,
          abacResult,
          businessRulesResult,
          policy.effect,
        ),
        integration_points: identifyIntegrationPoints(policy, testContext),
      };
    });

    // Generate final access decision
    const finalDecision = generateFinalAccessDecision(evaluationResults);

    res.json({
      scenario_type,
      test_context: testContext,
      action,
      evaluation_results: evaluationResults,
      final_decision: finalDecision,
      business_logic_explanation: generateBusinessLogicExplanation(
        evaluationResults,
        finalDecision,
      ),
      recommendations: generateRecommendations(evaluationResults, testContext),
    });
  } catch (error) {
    console.error("Error testing business scenario:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/business-policies/templates - Get business context templates
export const handleGetBusinessTemplates: RequestHandler = (req, res) => {
  try {
    res.json({
      templates: businessContextTemplates,
      scenarios: Object.keys(businessContextTemplates),
      usage_guidelines: {
        expense_approval: "用于测试费用审批工作流中的RBAC+ABAC集成",
        customer_access: "用于测试销售人员客户数据访问的区域化控制",
        hr_salary_access: "用于���试HR系统中敏感数据的分级访问",
        production_deployment: "用于测试生产环境部署的多重验证机制",
      },
    });
  } catch (error) {
    console.error("Error fetching business templates:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/business-policies/integration-analysis - Analyze RBAC+ABAC integration
export const handleIntegrationAnalysis: RequestHandler = (req, res) => {
  try {
    const analysis = {
      total_policies: businessPolicies.length,
      rbac_only_policies: businessPolicies.filter((p) => hasOnlyRBACRules(p))
        .length,
      abac_only_policies: businessPolicies.filter((p) => hasOnlyABACRules(p))
        .length,
      integrated_policies: businessPolicies.filter((p) => hasIntegratedRules(p))
        .length,

      integration_patterns: {
        role_based_foundation: "RBAC提供基础角色验证，ABAC添加上下文约束",
        attribute_enhanced_roles: "基于角色的权限通过属性条件进行精细化控制",
        dynamic_role_activation: "角色权限的激活依赖于动态上下文条件",
        business_rule_integration: "业务规则与访问控制策略的深度集成",
      },

      business_scenarios_coverage: {
        expense_approval: "费用审批流程的分级控制",
        data_access: "客户和员工数据的精细化访问管理",
        system_operations: "生产系统操作的时间和条件限制",
        emergency_procedures: "紧急情况下的临时权限提升",
      },

      complexity_metrics: {
        average_rules_per_policy: (
          businessPolicies.reduce((sum, p) => sum + p.rules.length, 0) /
          businessPolicies.length
        ).toFixed(2),
        average_conditions_per_rule: calculateAverageConditionsPerRule(),
        integration_complexity_score: calculateOverallIntegrationComplexity(),
      },

      recommendations: [
        "继续完善角色层次结构，为ABAC策略提供更好的基础",
        "增加更多业务上下文属性，提升策略的精准度",
        "建立策略冲突检测机制，确保RBAC和ABAC规则的一致性",
        "实施策略性能监控，优化复杂策略的评估效率",
      ],
    };

    res.json(analysis);
  } catch (error) {
    console.error("Error analyzing integration:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Helper functions for policy analysis
function analyzeRBACandABACIntegration(policy: ABACPolicy) {
  return {
    has_role_conditions: policy.rules.some((rule) =>
      rule.subject.some((cond) => cond.attribute === "user_roles"),
    ),
    has_attribute_conditions: policy.rules.some(
      (rule) =>
        rule.subject.some((cond) => cond.attribute !== "user_roles") ||
        rule.resource.length > 0 ||
        (rule.environment && rule.environment.length > 0),
    ),
    integration_complexity: policy.rules.reduce(
      (sum, rule) =>
        sum +
        rule.subject.length +
        rule.resource.length +
        (rule.environment?.length || 0),
      0,
    ),
    business_logic_elements: identifyBusinessLogicElements(policy),
  };
}

function getBusinessContext(policyId: string) {
  const contextMap = {
    "bpol-expense-approval-001": "expense_approval",
    "bpol-expense-approval-002": "expense_approval",
    "bpol-customer-data-region": "customer_access",
    "bpol-hr-salary-restriction": "hr_salary_access",
    "bpol-production-deploy-window": "production_deployment",
  };
  return contextMap[policyId] || "general";
}

function calculateComplexityScore(policy: ABACPolicy): number {
  let score = 0;
  policy.rules.forEach((rule) => {
    score += rule.subject.length * 2; // Role conditions weighted higher
    score += rule.resource.length * 1.5;
    score += (rule.environment?.length || 0) * 1.5;
    score += rule.action.length * 0.5;
  });
  return Math.round(score);
}

function generateIntegrationSummary(policies: any[]) {
  return {
    total_policies: policies.length,
    average_complexity: (
      policies.reduce((sum, p) => sum + p.complexity_score, 0) / policies.length
    ).toFixed(1),
    integration_distribution: {
      rbac_heavy: policies.filter(
        (p) =>
          p.integration_analysis.has_role_conditions &&
          !p.integration_analysis.has_attribute_conditions,
      ).length,
      abac_heavy: policies.filter(
        (p) =>
          !p.integration_analysis.has_role_conditions &&
          p.integration_analysis.has_attribute_conditions,
      ).length,
      integrated: policies.filter(
        (p) =>
          p.integration_analysis.has_role_conditions &&
          p.integration_analysis.has_attribute_conditions,
      ).length,
    },
  };
}

function evaluateRBACComponent(
  policy: ABACPolicy,
  context: any,
  action: string,
) {
  // Simplified RBAC evaluation focusing on role-based conditions
  const roleConditions = policy.rules.flatMap((rule) =>
    rule.subject.filter((cond) => cond.attribute === "user_roles"),
  );

  const userRoles = context.subject.user_roles || [];
  const hasRequiredRole = roleConditions.some((cond) => {
    if (cond.operator === "in" && Array.isArray(cond.value)) {
      return cond.value.some((role) => userRoles.includes(role));
    }
    return userRoles.includes(cond.value);
  });

  return {
    evaluated: true,
    passed: hasRequiredRole,
    applied_conditions: roleConditions.length,
    reason: hasRequiredRole ? "用户具有所需角色权限" : "用户缺少必要的角色权限",
  };
}

function evaluateABACComponent(
  policy: ABACPolicy,
  context: any,
  action: string,
) {
  // Simplified ABAC evaluation focusing on attribute-based conditions
  let totalConditions = 0;
  let passedConditions = 0;

  policy.rules.forEach((rule) => {
    // Evaluate non-role subject conditions
    rule.subject
      .filter((cond) => cond.attribute !== "user_roles")
      .forEach((cond) => {
        totalConditions++;
        if (evaluateCondition(cond, context.subject)) passedConditions++;
      });

    // Evaluate resource conditions
    rule.resource.forEach((cond) => {
      totalConditions++;
      if (evaluateCondition(cond, context.resource)) passedConditions++;
    });

    // Evaluate environment conditions
    (rule.environment || []).forEach((cond) => {
      totalConditions++;
      if (evaluateCondition(cond, context.environment)) passedConditions++;
    });
  });

  const passed = totalConditions === 0 || passedConditions === totalConditions;

  return {
    evaluated: true,
    passed,
    applied_conditions: totalConditions,
    passed_conditions: passedConditions,
    reason: passed
      ? "所有属性条件均满足"
      : `${passedConditions}/${totalConditions} 属性条件满足`,
  };
}

function evaluateBusinessRules(
  policy: ABACPolicy,
  context: any,
  action: string,
) {
  // Apply business-specific rules based on policy context
  const businessContext = getBusinessContext(policy.id);

  switch (businessContext) {
    case "expense_approval":
      return evaluateExpenseApprovalRules(context, action);
    case "customer_access":
      return evaluateCustomerAccessRules(context, action);
    case "hr_salary_access":
      return evaluateHRAccessRules(context, action);
    default:
      return { evaluated: false, passed: true, reason: "无特定业务规则" };
  }
}

function evaluateExpenseApprovalRules(context: any, action: string) {
  const amount = context.resource.amount || 0;
  const userRoles = context.subject.user_roles || [];
  const requiredApprover =
    businessRulesEngine.expenseApprovalRules.getRequiredApprover(
      amount,
      context.subject.department,
    );

  let passed = false;
  let reason = "";

  if (action === "submit" && userRoles.includes("employee")) {
    passed = amount < 1000;
    reason = passed ? "员工可直接提交小额费用" : "金额超出员工直接提交限额";
  } else if (action === "approve") {
    if (
      requiredApprover === "department_manager" &&
      userRoles.includes("department_manager")
    ) {
      passed = businessRulesEngine.expenseApprovalRules.checkDepartmentMatch(
        context.subject.department,
        context.resource.expense_department,
      );
      reason = passed ? "部门经理可审批本部门费用" : "只能审批本部门费用";
    }
  }

  return {
    evaluated: true,
    passed,
    reason,
    business_rules_applied: [
      "amount_threshold_check",
      "department_match_validation",
    ],
  };
}

function evaluateCustomerAccessRules(context: any, action: string) {
  const userRegion = context.subject.assigned_region;
  const customerRegion = context.resource.customer_region;
  const dataClassification = context.resource.data_classification;
  const userRole = context.subject.user_roles?.[0];

  const regionMatch =
    businessRulesEngine.customerAccessRules.validateRegionAccess(
      userRegion,
      customerRegion,
    );
  const dataAccess =
    businessRulesEngine.customerAccessRules.checkDataClassificationAccess(
      userRole,
      dataClassification,
    );

  const passed = regionMatch && dataAccess;

  return {
    evaluated: true,
    passed,
    reason: passed
      ? "区域和数据分类访问验证通过"
      : "区域不匹配或数据分类权限不足",
    business_rules_applied: ["region_validation", "data_classification_check"],
  };
}

function evaluateHRAccessRules(context: any, action: string) {
  const userRole = context.subject.user_roles?.[0];
  const clearanceLevel = context.subject.clearance_level || 0;
  const containsSalaryInfo = context.resource.contains_salary_info;

  if (containsSalaryInfo) {
    const accessLevel = businessRulesEngine.hrAccessRules.getSalaryAccessLevel(
      userRole,
      clearanceLevel,
    );
    const passed = accessLevel !== "none";

    return {
      evaluated: true,
      passed,
      reason: passed
        ? `具有${accessLevel}级别薪资信息访问权限`
        : "缺少薪资信息访问权限",
      business_rules_applied: ["salary_access_level_check"],
    };
  }

  return { evaluated: true, passed: true, reason: "非薪资信息，允许访问" };
}

function evaluateCondition(condition: any, contextData: any): boolean {
  const value = contextData[condition.attribute];

  switch (condition.operator) {
    case "equals":
      return value === condition.value;
    case "not_equals":
      return value !== condition.value;
    case "in":
      return Array.isArray(condition.value) && condition.value.includes(value);
    case "not_in":
      return Array.isArray(condition.value) && !condition.value.includes(value);
    case "greater_than":
      return Number(value) > Number(condition.value);
    case "less_than":
      return Number(value) < Number(condition.value);
    default:
      return false;
  }
}

function combinePolicyResults(
  rbacResult: any,
  abacResult: any,
  businessResult: any,
  effect: string,
) {
  const allPassed =
    rbacResult.passed && abacResult.passed && businessResult.passed;

  if (effect === "deny") {
    return allPassed ? "deny" : "allow"; // Deny policy: if all conditions match, deny
  } else {
    return allPassed ? "allow" : "deny"; // Allow policy: if all conditions match, allow
  }
}

function generateFinalAccessDecision(evaluationResults: any[]) {
  // Sort by priority (higher first)
  const sortedResults = evaluationResults.sort(
    (a, b) => b.priority - a.priority,
  );

  // Find first matching policy
  for (const result of sortedResults) {
    if (result.final_decision === "deny") {
      return {
        decision: "deny",
        reason: `访问被策略 "${result.policyName}" 拒绝`,
        applied_policy: result.policyId,
        priority: result.priority,
      };
    } else if (result.final_decision === "allow") {
      return {
        decision: "allow",
        reason: `访问被策略 "${result.policyName}" 允许`,
        applied_policy: result.policyId,
        priority: result.priority,
      };
    }
  }

  return {
    decision: "deny",
    reason: "没有匹配的允许策略",
    applied_policy: null,
    priority: 0,
  };
}

function generateBusinessLogicExplanation(
  evaluationResults: any[],
  finalDecision: any,
) {
  return {
    decision_summary: finalDecision.reason,
    rbac_contribution: "角色权限验证提供了基础的访问控制",
    abac_contribution: "属性条件确保了上下文相关的精细化控制",
    business_rules_contribution: "业务规则实现了特定的组织政策和流程要求",
    integration_benefits: [
      "RBAC提供了稳定的权限基础，简化了用户权限管理",
      "ABAC增加了灵活性，支持复杂的业务场景",
      "业务规则确保了访问控制与实际业务流程的一致性",
    ],
  };
}

function generateRecommendations(evaluationResults: any[], context: any) {
  const recommendations = [];

  // Analyze failed evaluations
  evaluationResults.forEach((result) => {
    if (!result.rbac_evaluation.passed) {
      recommendations.push({
        type: "rbac_improvement",
        suggestion: "考虑调整用户角色分配或优化角色权限结构",
      });
    }

    if (!result.abac_evaluation.passed) {
      recommendations.push({
        type: "abac_improvement",
        suggestion: "检查属性配置，确保上下文信息的准确性",
      });
    }

    if (!result.business_rules_evaluation.passed) {
      recommendations.push({
        type: "business_rules_improvement",
        suggestion: "审查业务流程，确保访问控制策略与业务需求匹配",
      });
    }
  });

  return recommendations;
}

// Additional helper functions
function identifyIntegrationPoints(policy: ABACPolicy, context: any) {
  return {
    role_attribute_binding: "角色权限与用户属性的绑定关系",
    context_dependent_roles: "依赖上下文的角色激活条件",
    attribute_enhanced_permissions: "通过属性增强的权限控制",
    business_rule_integration: "业务规则与访问控制的集成点",
  };
}

function identifyBusinessLogicElements(policy: ABACPolicy) {
  const elements = [];

  policy.rules.forEach((rule) => {
    if (rule.subject.some((c) => c.attribute === "department"))
      elements.push("department_based_control");
    if (rule.resource.some((c) => c.attribute === "amount"))
      elements.push("amount_threshold_control");
    if (rule.environment?.some((c) => c.attribute === "time"))
      elements.push("time_based_control");
    if (rule.environment?.some((c) => c.attribute === "location"))
      elements.push("location_based_control");
  });

  return [...new Set(elements)];
}

function hasOnlyRBACRules(policy: ABACPolicy): boolean {
  return policy.rules.every(
    (rule) =>
      rule.subject.every((cond) => cond.attribute === "user_roles") &&
      rule.resource.length === 0 &&
      (!rule.environment || rule.environment.length === 0),
  );
}

function hasOnlyABACRules(policy: ABACPolicy): boolean {
  return policy.rules.every((rule) =>
    rule.subject.every((cond) => cond.attribute !== "user_roles"),
  );
}

function hasIntegratedRules(policy: ABACPolicy): boolean {
  return policy.rules.some(
    (rule) =>
      rule.subject.some((cond) => cond.attribute === "user_roles") &&
      (rule.subject.some((cond) => cond.attribute !== "user_roles") ||
        rule.resource.length > 0 ||
        (rule.environment && rule.environment.length > 0)),
  );
}

function calculateAverageConditionsPerRule(): string {
  const totalConditions = businessPolicies.reduce(
    (sum, policy) =>
      sum +
      policy.rules.reduce(
        (ruleSum, rule) =>
          ruleSum +
          rule.subject.length +
          rule.resource.length +
          (rule.environment?.length || 0),
        0,
      ),
    0,
  );

  const totalRules = businessPolicies.reduce(
    (sum, policy) => sum + policy.rules.length,
    0,
  );

  return (totalConditions / totalRules).toFixed(2);
}

function calculateOverallIntegrationComplexity(): number {
  return businessPolicies.reduce(
    (sum, policy) => sum + calculateComplexityScore(policy),
    0,
  );
}
