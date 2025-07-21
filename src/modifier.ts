import { Trigger, TriggerType } from "./trigger";
import { Timestep } from "./timestep";
import { Simulation } from "./simulation";

export enum ModifierMode {
  ABSOLUTE = "absolute",
  RELATIVE = "relative",
  SET = "set",
  DELAY = "delay",
}

export class Modifier {
  id: string;
  attribute: string;
  mode: ModifierMode;
  value: number;
  trigger?: Trigger;

  constructor(
    id: string,
    attribute: string,
    mode: string,
    value: number,
    trigger?: Trigger
  ) {
    this.id = id;
    this.attribute = attribute;
    this.mode = mode as ModifierMode;
    this.value = value;
    this.trigger = trigger;
  }

  /**
   * Check if the modifier should be applied based on its trigger condition
   */
  shouldApply(timestep: Timestep, simulation: Simulation): boolean {
    if (!this.trigger) return true; // No trigger means always apply when active

    return this.trigger.evaluate(timestep, simulation);
  }

  apply(base: number, attribute: string, timestep: Timestep): number {
    switch (this.mode) {
      case ModifierMode.ABSOLUTE:
        console.log(
          `Applying absolute modifier ${this.id} for attribute ${attribute} at timestep ${timestep.step}`
        );
        return this.value + base;
      case ModifierMode.RELATIVE:
        console.log(
          `Applying relative modifier ${this.id} for attribute ${attribute} at timestep ${timestep.step}`
        );
        return base * this.value;
      case ModifierMode.SET:
        console.log(
          `Applying set modifier ${this.id} for attribute ${attribute} at timestep ${timestep.step}`
        );
        return this.value;
      case ModifierMode.DELAY:
        console.log(
          `Applying delayed modifier ${this.id} for attribute ${attribute} at timestep ${timestep.step}`
        );
        const simulation = timestep.simulation;
        const delayTrigger = Trigger.createTimestepRange(
          timestep.step + 1,
          timestep.step + 1
        );
        const delayedModifier = new Modifier(
          `delay_${timestep.step}_${this.id}`,
          attribute,
          ModifierMode.ABSOLUTE,
          this.value,
          delayTrigger
        );
        simulation.addModifier(delayedModifier);
        return 0; // Return 0 for current timestep, effect happens later
      default:
        throw new Error(`Unknown modifier mode: ${this.mode}`);
    }
  }
}
