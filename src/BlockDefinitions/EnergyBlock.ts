import { Block, BlockType } from "../block";
import { Attribute } from "../attribute";
import { Simulation } from "../simulation";

export enum BaseIDs {
  energyCost = "energyCost",
}

export function initializeEnergyBlock(block: Block, simulation: Simulation) {
  const energyData = simulation.input.energy;

  new Attribute(BaseIDs.energyCost, block, (timestep) =>
    simulation.applyModifier(energyData.energyCost, BaseIDs.energyCost)
  );
}
