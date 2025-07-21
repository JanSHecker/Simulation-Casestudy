import { Attribute } from "./attribute";
import { Timestep } from "./timestep";
import { Materials, Products } from "./simulation";

export enum BlockType {
  PRODUCTION = "production",
  PRODUCT = "product",
  STORAGE = "storage",
  MATERIAL = "material",
  LEGAL = "legal",
  ENERGY = "energy",
  TOTAL = "total",
}

export interface BlockOptions {
  product?: Products;
  material?: Materials;
}

export class Block {
  id: string;
  attributes: { [key: string]: Attribute };
  timestep: Timestep;
  constructor(id: string, timestep: Timestep) {
    this.id = id;
    this.timestep = timestep;
    this.attributes = {};
  }
  getAttribute(attributeId: string): number {
    const attribute = this.attributes[attributeId];
    return attribute.value;
  }
}
