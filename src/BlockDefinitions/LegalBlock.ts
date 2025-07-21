import { Block, BlockType } from "../block";
import { Attribute } from "../attribute";
import { Simulation } from "../simulation";

export enum BaseIDs {
  co2Tax = "co2Tax",
}

export function initializeLegalBlock(block: Block, simulation: Simulation) {
  const legalData = simulation.input.legal;

  new Attribute(BaseIDs.co2Tax, block, (timestep) =>
    simulation.applyModifier(legalData.co2Tax, BaseIDs.co2Tax, timestep)
  );
}
