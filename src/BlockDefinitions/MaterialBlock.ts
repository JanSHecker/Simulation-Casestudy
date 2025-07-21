import { Block, BlockType } from "../block";
import { Attribute } from "../attribute";
import { Simulation, Materials } from "../simulation";
import { BaseIDs as LegalBaseIDs } from "./LegalBlock";

export enum BaseIDs {
  basePrice = "basePrice",
  tariffRate = "tariffRate",
  co2EmissionPerUnit = "co2EmissionPerUnit",
  co2TaxCostPerUnit = "co2TaxCostPerUnit",
  costPerUnit = "costPerUnit",
}
export function getMaterialAttributeId(
  material: Materials,
  baseId: BaseIDs
): string {
  return `${material}_${baseId}`;
}

export function initializeMaterialBlock(
  block: Block,
  material: Materials,
  simulation: Simulation
) {
  const materialData = simulation.input.materials[material];

  // Base price and tariff
  new Attribute(
    getMaterialAttributeId(material, BaseIDs.basePrice),
    block,
    (timestep) =>
      simulation.applyModifier(
        materialData.basePrice,
        getMaterialAttributeId(material, BaseIDs.basePrice)
      )
  );

  new Attribute(
    getMaterialAttributeId(material, BaseIDs.tariffRate),
    block,
    (timestep) =>
      simulation.applyModifier(
        materialData.tariffRate,
        getMaterialAttributeId(material, BaseIDs.tariffRate)
      )
  );

  // CO2 related attributes
  new Attribute(
    getMaterialAttributeId(material, BaseIDs.co2EmissionPerUnit),
    block,
    (timestep) =>
      simulation.applyModifier(
        materialData.co2EmissionPerUnit,
        getMaterialAttributeId(material, BaseIDs.co2EmissionPerUnit)
      )
  );

  new Attribute(
    getMaterialAttributeId(material, BaseIDs.co2TaxCostPerUnit),
    block,
    (timestep) =>
      simulation.applyModifier(
        materialData.co2EmissionPerUnit *
          block.timestep
            .getBlock(BlockType.LEGAL)
            .getAttribute(LegalBaseIDs.co2Tax),
        getMaterialAttributeId(material, BaseIDs.co2TaxCostPerUnit)
      )
  );

  // Total cost with all factors
  new Attribute(
    getMaterialAttributeId(material, BaseIDs.costPerUnit),
    block,
    (timestep) =>
      simulation.applyModifier(
        materialData.basePrice +
          materialData.tariffRate * materialData.basePrice +
          materialData.co2EmissionPerUnit *
            block.timestep
              .getBlock(BlockType.LEGAL)
              .getAttribute(LegalBaseIDs.co2Tax),
        getMaterialAttributeId(material, BaseIDs.costPerUnit)
      )
  );
}
