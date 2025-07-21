import { Trigger } from "./trigger";
import { Timestep } from "./timestep";
import { Simulation } from "./simulation";

export class Modifier {
  id: string;
  attribute: string;
  mode: "absolute" | "relative" | "set" | "delay";
  value: number;
  active: boolean;
  trigger?: Trigger;

  constructor(
    id: string,
    attribute: string,
    mode: string,
    value: number,
    active: boolean = true,
    trigger?: Trigger
  ) {
    this.id = id;
    this.attribute = attribute;
    this.mode = mode as "absolute" | "relative" | "set" | "delay";
    this.value = value;
    this.active = active;
    this.trigger = trigger;
  }

  /**
   * Check if the modifier should be applied based on its trigger condition
   */
  shouldApply(timestep: Timestep, simulation: Simulation): boolean {
    if (!this.active) return false;
    if (!this.trigger) return true; // No trigger means always apply when active

    return this.trigger.evaluate(timestep, simulation);
  }

  apply(base: number): number {
    switch (this.mode) {
      case "absolute":
        return this.value + base;
      case "relative":
        return base * this.value;
      case "set":
        return this.value;
      case "delay":
        // Implement delay logic if needed
        return base; // Placeholder for delay logic
      default:
        throw new Error(`Unknown modifier mode: ${this.mode}`);
    }
  }
}
