import { Block, BlockType } from "../block";
import { Simulation, Products, Materials } from "../simulation";
import {
  getProductionAttributeId,
  BaseIDs as ProductionBaseIDs,
} from "./ProductionBlock";
import { BaseIDs as LegalBaseIDs } from "./LegalBlock";
import { Attribute } from "../attribute";

export enum BaseIDs {
  producedUnits = "producedUnits",
  energyUse = "energyUse",
  energyCost = "energyCost",
  co2Emission = "co2Emission",
  co2TaxCost = "co2TaxCost",
  materialUse = "materialUse",
  materialCost = "materialCost",
  totalCost = "totalCost",
}

export function getProductAttributeId(
  product: Products,
  baseId: BaseIDs,
  material?: string
): string {
  if (material) {
    return `${product}_${material}_${baseId}`;
  }
  return `${product}_${baseId}`;
}

export function initializeProductBlock(
  block: Block,
  product: Products,
  simulation: Simulation
) {
  const productData = simulation.input.products[product];

  // Base production units from input (direct from input data)
  new Attribute(
    getProductAttributeId(product, BaseIDs.producedUnits),
    block,
    (timestep) =>
      simulation.applyModifier(
        productData.producedUnits,
        getProductAttributeId(product, BaseIDs.producedUnits)
      )
  );

  // Calculate energy use for this product
  // Formula: energyUse = producedUnits * energyConsumptionPerUnit
  new Attribute(
    getProductAttributeId(product, BaseIDs.energyUse),
    block,
    (timestep) =>
      simulation.applyModifier(
        block.getAttribute(
          getProductAttributeId(product, BaseIDs.producedUnits)
        ) *
          block.timestep
            .getBlock(BlockType.PRODUCTION, { product })
            .getAttribute(
              getProductionAttributeId(
                product,
                ProductionBaseIDs.energyConsumptionPerUnit
              )
            ),
        getProductAttributeId(product, BaseIDs.energyUse)
      )
  );

  // Get total energy cost for this product
  // Formula: energyCost = producedUnits * energyCostPerUnit
  new Attribute(
    getProductAttributeId(product, BaseIDs.energyCost),
    block,
    (timestep) =>
      simulation.applyModifier(
        block.getAttribute(
          getProductAttributeId(product, BaseIDs.producedUnits)
        ) *
          block.timestep
            .getBlock(BlockType.PRODUCTION, { product })
            .getAttribute(
              getProductionAttributeId(
                product,
                ProductionBaseIDs.energyCostPerUnit
              )
            ),
        getProductAttributeId(product, BaseIDs.energyCost)
      )
  );

  // Calculate CO2 emission for this product
  // Formula: co2Emission = producedUnits * emittedCo2PerUnit
  new Attribute(
    getProductAttributeId(product, BaseIDs.co2Emission),
    block,
    (timestep) =>
      simulation.applyModifier(
        block.getAttribute(
          getProductAttributeId(product, BaseIDs.producedUnits)
        ) *
          block.timestep
            .getBlock(BlockType.PRODUCTION, { product })
            .getAttribute(
              getProductionAttributeId(
                product,
                ProductionBaseIDs.emittedCo2PerUnit
              )
            ),
        getProductAttributeId(product, BaseIDs.co2Emission)
      )
  );

  // Calculate CO2 tax cost for this product
  // Formula: co2TaxCost = co2Emission * co2Tax
  new Attribute(
    getProductAttributeId(product, BaseIDs.co2TaxCost),
    block,
    (timestep) =>
      simulation.applyModifier(
        block.getAttribute(
          getProductAttributeId(product, BaseIDs.co2Emission)
        ) *
          block.timestep
            .getBlock(BlockType.LEGAL)
            .getAttribute(LegalBaseIDs.co2Tax),
        getProductAttributeId(product, BaseIDs.co2TaxCost)
      )
  );

  // For each material, calculate its use and cost
  for (const material of Object.keys(
    simulation.input.materials
  ) as Materials[]) {
    // Calculate material use for this product
    new Attribute(
      getProductAttributeId(product, BaseIDs.materialUse, material),
      block,
      (timestep) =>
        simulation.applyModifier(
          block.getAttribute(
            getProductAttributeId(product, BaseIDs.producedUnits)
          ) *
            block.timestep
              .getBlock(BlockType.PRODUCTION, { product })
              .getAttribute(
                getProductionAttributeId(
                  product,
                  ProductionBaseIDs.consumptionPerUnit,
                  material
                )
              ),
          getProductAttributeId(product, BaseIDs.materialUse, material)
        )
    );

    // Calculate material cost for this product
    new Attribute(
      getProductAttributeId(product, BaseIDs.materialCost, material),
      block,
      (timestep) =>
        simulation.applyModifier(
          block.getAttribute(
            getProductAttributeId(product, BaseIDs.producedUnits)
          ) *
            block.timestep
              .getBlock(BlockType.PRODUCTION, { product })
              .getAttribute(
                getProductionAttributeId(
                  product,
                  ProductionBaseIDs.costPerProduct,
                  material
                )
              ),
          getProductAttributeId(product, BaseIDs.materialCost, material)
        )
    );
  }

  // Calculate total material cost by summing all individual material costs
  new Attribute(
    getProductAttributeId(product, BaseIDs.materialCost),
    block,
    (timestep) => {
      let total = 0;
      for (const material of Object.keys(
        simulation.input.materials
      ) as Materials[]) {
        total += block.getAttribute(
          getProductAttributeId(product, BaseIDs.materialCost, material)
        );
      }
      return simulation.applyModifier(
        total,
        getProductAttributeId(product, BaseIDs.materialCost)
      );
    }
  );

  // Calculate total cost including all factors
  // Formula: totalCost = energyCost + materialCost + co2TaxCost
  new Attribute(
    getProductAttributeId(product, BaseIDs.totalCost),
    block,
    (timestep) =>
      simulation.applyModifier(
        block.getAttribute(getProductAttributeId(product, BaseIDs.energyCost)) +
          block.getAttribute(
            getProductAttributeId(product, BaseIDs.materialCost)
          ) +
          block.getAttribute(
            getProductAttributeId(product, BaseIDs.co2TaxCost)
          ),
        getProductAttributeId(product, BaseIDs.totalCost)
      )
  );
}
