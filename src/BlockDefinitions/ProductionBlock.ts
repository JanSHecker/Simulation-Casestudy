import { Block, BlockType } from "../block";
import { Attribute } from "../attribute";
import { Simulation, Products, Materials } from "../simulation";
import {
  getMaterialAttributeId,
  BaseIDs as MaterialBaseIDs,
} from "./MaterialBlock";
import { BaseIDs as EnergyBaseIDs } from "./EnergyBlock";
import { BaseIDs as LegalBaseIDs } from "./LegalBlock";

export enum BaseIDs {
  energyConsumptionPerUnit = "energyConsumptionPerUnit",
  energyCostPerUnit = "energyCostPerUnit",
  emittedCo2PerUnit = "emittedCo2PerUnit",
  co2TaxCostPerUnit = "co2TaxCostPerUnit",
  consumptionPerUnit = "consumptionPerUnit",
  costPerProduct = "costPerProduct",
  totalMaterialCostPerProduct = "totalMaterialCostPerProduct",
  totalCostPerProduct = "totalCostPerProduct",
}
export function getProductionAttributeId(
  product: Products,
  baseId: BaseIDs,
  material?: string
): string {
  if (material) {
    return `${product}_${material}_${baseId}`;
  }
  return `${product}_${baseId}`;
}

export function initializeProductionBlock(
  block: Block,
  product: Products,
  simulation: Simulation
) {
  const productData = simulation.input.products[product];

  // Energy and CO2
  new Attribute(
    getProductionAttributeId(product, BaseIDs.energyConsumptionPerUnit),
    block,
    (timestep) =>
      simulation.applyModifier(
        productData.production.energyConsumptionPerUnit,
        getProductionAttributeId(product, BaseIDs.energyConsumptionPerUnit),
        timestep
      )
  );

  new Attribute(
    getProductionAttributeId(product, BaseIDs.energyCostPerUnit),
    block,
    (timestep) =>
      simulation.applyModifier(
        block.getAttribute(
          getProductionAttributeId(product, BaseIDs.energyConsumptionPerUnit)
        ) *
          block.timestep
            .getBlock(BlockType.ENERGY)
            .getAttribute(EnergyBaseIDs.energyCost),
        getProductionAttributeId(product, BaseIDs.energyCostPerUnit),
        timestep
      )
  );

  // CO2 related attributes
  new Attribute(
    getProductionAttributeId(product, BaseIDs.emittedCo2PerUnit),
    block,
    (timestep) =>
      simulation.applyModifier(
        productData.production.co2EmissionPerUnit,
        getProductionAttributeId(product, BaseIDs.emittedCo2PerUnit),
        timestep
      )
  );

  new Attribute(
    getProductionAttributeId(product, BaseIDs.co2TaxCostPerUnit),
    block,
    (timestep) =>
      simulation.applyModifier(
        block.getAttribute(
          getProductionAttributeId(product, BaseIDs.emittedCo2PerUnit)
        ) *
          block.timestep
            .getBlock(BlockType.LEGAL)
            .getAttribute(LegalBaseIDs.co2Tax),
        getProductionAttributeId(product, BaseIDs.co2TaxCostPerUnit),
        timestep
      )
  );

  // Material consumption and costs - dynamically handle all materials
  let totalMaterialCostAttributes: string[] = [];

  for (const material of Object.keys(
    simulation.input.materials
  ) as Materials[]) {
    // Add consumption attribute for this material
    new Attribute(
      getProductionAttributeId(product, BaseIDs.consumptionPerUnit, material),
      block,
      (timestep) =>
        simulation.applyModifier(
          productData.production[`${material}Consumption`],
          getProductionAttributeId(
            product,
            BaseIDs.consumptionPerUnit,
            material
          ),
          timestep
        )
    );

    // Add cost attribute for this material
    new Attribute(
      getProductionAttributeId(product, BaseIDs.costPerProduct, material),
      block,
      (timestep) =>
        simulation.applyModifier(
          block.getAttribute(
            getProductionAttributeId(
              product,
              BaseIDs.consumptionPerUnit,
              material
            )
          ) *
            block.timestep
              .getBlock(BlockType.MATERIAL, { material })
              .getAttribute(
                getMaterialAttributeId(
                  material as Materials,
                  MaterialBaseIDs.costPerUnit
                )
              ),
          getProductionAttributeId(product, BaseIDs.costPerProduct, material),
          timestep
        )
    );

    // Keep track of cost attributes for total calculation
    totalMaterialCostAttributes.push(
      getProductionAttributeId(product, BaseIDs.costPerProduct, material)
    );
  }

  // Calculate total material cost from all materials
  new Attribute(
    getProductionAttributeId(product, BaseIDs.totalMaterialCostPerProduct),
    block,
    (timestep) =>
      simulation.applyModifier(
        totalMaterialCostAttributes.reduce(
          (sum, attrId) => sum + block.getAttribute(attrId),
          0
        ),
        getProductionAttributeId(product, BaseIDs.totalMaterialCostPerProduct),
        timestep
      )
  );

  new Attribute(
    getProductionAttributeId(product, BaseIDs.totalCostPerProduct),
    block,
    (timestep) =>
      simulation.applyModifier(
        block.getAttribute(
          getProductionAttributeId(product, BaseIDs.totalMaterialCostPerProduct)
        ) +
          block.getAttribute(
            getProductionAttributeId(product, BaseIDs.energyCostPerUnit)
          ) +
          block.getAttribute(
            getProductionAttributeId(product, BaseIDs.co2TaxCostPerUnit)
          ),
        getProductionAttributeId(product, BaseIDs.totalCostPerProduct),
        timestep
      )
  );
}
