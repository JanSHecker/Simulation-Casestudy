import { Timestep } from "./timestep";
import { Simulation } from "./simulation";

export enum TriggerType {
  TIMESTEP_RANGE = "timestep_range",
  ATTRIBUTE_THRESHOLD = "attribute_threshold",
  ATTRIBUTE_COMPARISON = "attribute_comparison",
  COMBINED = "combined",
}

export enum ComparisonOperator {
  GREATER_THAN = "gt",
  LESS_THAN = "lt",
  GREATER_EQUAL = "gte",
  LESS_EQUAL = "lte",
  EQUALS = "eq",
  NOT_EQUALS = "neq",
}

export enum LogicalOperator {
  AND = "and",
  OR = "or",
}

export interface TriggerCondition {
  type: TriggerType;
  // For timestep range
  minTimestep?: number;
  maxTimestep?: number;
  // For attribute conditions
  blockId?: string;
  attributeId?: string;
  operator?: ComparisonOperator;
  value?: number;
  // For combined conditions
  conditions?: TriggerCondition[];
  logicalOperator?: LogicalOperator;
}

export class Trigger {
  condition: TriggerCondition;

  constructor(condition: TriggerCondition) {
    this.condition = condition;
  }

  /**
   * Evaluate if the trigger condition is met
   */
  evaluate(timestep: Timestep, simulation: Simulation): boolean {
    return this.evaluateCondition(this.condition, timestep, simulation);
  }

  private evaluateCondition(
    condition: TriggerCondition,
    timestep: Timestep,
    simulation: Simulation
  ): boolean {
    switch (condition.type) {
      case TriggerType.TIMESTEP_RANGE:
        return this.evaluateTimestepRange(condition, timestep);

      case TriggerType.ATTRIBUTE_THRESHOLD:
      case TriggerType.ATTRIBUTE_COMPARISON:
        return this.evaluateAttributeCondition(condition, timestep);

      case TriggerType.COMBINED:
        return this.evaluateCombinedCondition(condition, timestep, simulation);

      default:
        return false;
    }
  }

  private evaluateTimestepRange(
    condition: TriggerCondition,
    timestep: Timestep
  ): boolean {
    const { minTimestep = 0, maxTimestep = Infinity } = condition;
    return timestep.step >= minTimestep && timestep.step <= maxTimestep;
  }

  private evaluateAttributeCondition(
    condition: TriggerCondition,
    timestep: Timestep
  ): boolean {
    const { blockId, attributeId, operator, value } = condition;

    // Ensure all required fields are present
    if (!blockId || !attributeId || !operator || value === undefined) {
      console.log("Invalid attribute condition:", condition);
      return false;
    }

    try {
      // Use previous timestep for attribute evaluation to avoid dependency issues
      // For timestep 0, use current timestep as fallback
      const evaluationTimestep =
        timestep.step > 0
          ? timestep.simulation.timesteps[timestep.step - 1]
          : timestep;

      const block = evaluationTimestep.blocks[blockId];
      if (!block) {
        console.log(
          `Block ${blockId} not found in timestep ${evaluationTimestep.step}`
        );
        return false;
      }
      const attributeValue = block.getAttribute(attributeId);

      return this.compareValues(attributeValue, operator, value);
    } catch (error) {
      console.log("Error evaluating attribute condition:", error);
      return false;
    }
  }

  private evaluateCombinedCondition(
    condition: TriggerCondition,
    timestep: Timestep,
    simulation: Simulation
  ): boolean {
    const { conditions = [], logicalOperator = LogicalOperator.AND } =
      condition;

    if (conditions.length === 0) return true;

    const results = conditions.map((cond) =>
      this.evaluateCondition(cond, timestep, simulation)
    );

    return logicalOperator === LogicalOperator.AND
      ? results.every((result) => result)
      : results.some((result) => result);
  }

  private compareValues(
    attributeValue: number,
    operator: ComparisonOperator,
    targetValue: number
  ): boolean {
    switch (operator) {
      case ComparisonOperator.GREATER_THAN:
        return attributeValue > targetValue;
      case ComparisonOperator.LESS_THAN:
        return attributeValue < targetValue;
      case ComparisonOperator.GREATER_EQUAL:
        return attributeValue >= targetValue;
      case ComparisonOperator.LESS_EQUAL:
        return attributeValue <= targetValue;
      case ComparisonOperator.EQUALS:
        return attributeValue === targetValue;
      case ComparisonOperator.NOT_EQUALS:
        return attributeValue !== targetValue;
      default:
        return false;
    }
  }

  /**
   * Helper method to create common trigger types
   */
  static createTimestepRange(
    minTimestep: number,
    maxTimestep: number
  ): Trigger {
    return new Trigger({
      type: TriggerType.TIMESTEP_RANGE,
      minTimestep,
      maxTimestep,
    });
  }

  static createAttributeThreshold(
    blockId: string,
    attributeId: string,
    operator: ComparisonOperator,
    value: number
  ): Trigger {
    return new Trigger({
      type: TriggerType.ATTRIBUTE_THRESHOLD,
      blockId,
      attributeId,
      operator,
      value,
    });
  }

  static createCombined(
    conditions: TriggerCondition[],
    logicalOperator: LogicalOperator = LogicalOperator.AND
  ): Trigger {
    return new Trigger({
      type: TriggerType.COMBINED,
      conditions,
      logicalOperator,
    });
  }
}
