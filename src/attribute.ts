import { Block } from "./block";
import { Timestep } from "./timestep";

export class Attribute {
  id: string;
  block: Block;
  value: number;
  calculation: (timestep: Timestep) => number;
  canBeNegative: boolean;

  constructor(
    id: string,
    block: Block,
    calculation: (timestep: Timestep) => number,
    canBeNegative: boolean = true
  ) {
    this.id = id;
    this.block = block;
    this.calculation = calculation;
    this.canBeNegative = canBeNegative;
    this.value = 0; // Initialize with 0, will be calculated later

    // Register this attribute with the block
    this.block.attributes[this.id] = this;
  }

  calculate() {
    let calculatedValue = this.calculation(this.block.timestep);

    // Apply constraints based on the optional parameters
    if (!this.canBeNegative && calculatedValue < 0) {
      calculatedValue = 0;
    }

    this.value = calculatedValue;
  }
}
