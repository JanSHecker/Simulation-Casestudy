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
  // Formula: basePrice (from input configuration)
  new Attribute(
    getMaterialAttributeId(material, BaseIDs.basePrice),
    block,
    (timestep) =>
      simulation.applyModifier(
        materialData.basePrice,
        getMaterialAttributeId(material, BaseIDs.basePrice),
        timestep
      )
  );

  // Formula: tariffRate (from input configuration)
  new Attribute(
    getMaterialAttributeId(material, BaseIDs.tariffRate),
    block,
    (timestep) =>
      simulation.applyModifier(
        materialData.tariffRate,
        getMaterialAttributeId(material, BaseIDs.tariffRate),
        timestep
      )
  );

  // CO2 related attributes
  // Formula: co2EmissionPerUnit (from input configuration)
  new Attribute(
    getMaterialAttributeId(material, BaseIDs.co2EmissionPerUnit),
    block,
    (timestep) =>
      simulation.applyModifier(
        materialData.co2EmissionPerUnit,
        getMaterialAttributeId(material, BaseIDs.co2EmissionPerUnit),
        timestep
      )
  );

  // Formula: co2TaxCostPerUnit = co2EmissionPerUnit × co2Tax
  new Attribute(
    getMaterialAttributeId(material, BaseIDs.co2TaxCostPerUnit),
    block,
    (timestep) =>
      simulation.applyModifier(
        materialData.co2EmissionPerUnit *
          block.timestep
            .getBlock(BlockType.LEGAL)
            .getAttribute(LegalBaseIDs.co2Tax),
        getMaterialAttributeId(material, BaseIDs.co2TaxCostPerUnit),
        timestep
      )
  );

  // Formula: costPerUnit = (basePrice + co2TaxCostPerUnit) × (1 + tariffRate)
  // Uses calculated attributes instead of raw input values
  new Attribute(
    getMaterialAttributeId(material, BaseIDs.costPerUnit),
    block,
    (timestep) => {
      const basePrice = block.getAttribute(
        getMaterialAttributeId(material, BaseIDs.basePrice)
      );
      const tariffRate = block.getAttribute(
        getMaterialAttributeId(material, BaseIDs.tariffRate)
      );
      const co2TaxCost = block.getAttribute(
        getMaterialAttributeId(material, BaseIDs.co2TaxCostPerUnit)
      );

      const basePriceWithCo2 = basePrice + co2TaxCost;
      const totalCostWithTariff = basePriceWithCo2 * (1 + tariffRate);

      return simulation.applyModifier(
        totalCostWithTariff,
        getMaterialAttributeId(material, BaseIDs.costPerUnit),
        timestep
      );
    }
  );
}
