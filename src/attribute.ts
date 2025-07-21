import { Block } from "./block";
import { Timestep } from "./timestep";

export class Attribute {
  id: string;
  block: Block;
  value: number;
  calculation: (timestep: Timestep) => number;

  constructor(
    id: string,
    block: Block,
    calculation: (timestep: Timestep) => number
  ) {
    this.id = id;
    this.block = block;
    this.calculation = calculation;
    this.value = 0; // Initialize with 0, will be calculated later

    // Register this attribute with the block
    this.block.attributes[this.id] = this;
  }

  calculate() {
    this.value = this.calculation(this.block.timestep);
  }
}
