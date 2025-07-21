import { Block, BlockType } from "../block";
import { Attribute } from "../attribute";
import { Simulation, Products, Materials } from "../simulation";
import { BaseIDs as EnergyBaseIDs } from "./EnergyBlock";
import { BaseIDs as LegalBaseIDs } from "./LegalBlock";
import { getMaterialAttributeId } from "./MaterialBlock";
import {
  getProductAttributeId as getProdAttrId,
  BaseIDs as ProductBaseIDs,
} from "./ProductBlock";

export enum BaseIDs {
  total_energy_use = "total_energy_use",
  total_energy_cost = "total_energy_cost",
  total_co2_emission = "total_co2_emission",
  total_co2_tax_cost = "total_co2_tax_cost",
  total_consumed = "total_consumed",
  total_cost = "total_cost",
  total_material_costs = "total_material_costs",
  total_all_costs = "total_all_costs",
}

export function getTotalAttributeId(
  baseId: BaseIDs,
  material?: Materials
): string {
  if (material) {
    return `${material}_${baseId}`;
  }
  return baseId;
}

export function initializeTotalBlock(block: Block, simulation: Simulation) {
  // Calculate total energy use for all products in this timestep
  new Attribute(
    getTotalAttributeId(BaseIDs.total_energy_use),
    block,
    (timestep) => {
      let total = 0;
      for (const product of Object.keys(
        simulation.input.products
      ) as Products[]) {
        total += timestep
          .getBlock(BlockType.PRODUCT, { product })
          .getAttribute(getProdAttrId(product, ProductBaseIDs.energyUse));
      }
      return simulation.applyModifier(
        total,
        getTotalAttributeId(BaseIDs.total_energy_use),
        timestep
      );
    }
  );

  // Calculate total energy cost for all products in this timestep
  new Attribute(
    getTotalAttributeId(BaseIDs.total_energy_cost),
    block,
    (timestep) => {
      let total = 0;
      for (const product of Object.keys(
        simulation.input.products
      ) as Products[]) {
        total += timestep
          .getBlock(BlockType.PRODUCT, { product })
          .getAttribute(getProdAttrId(product, ProductBaseIDs.energyCost));
      }
      return simulation.applyModifier(
        total,
        getTotalAttributeId(BaseIDs.total_energy_cost),
        timestep
      );
    }
  );

  // Calculate total CO2 emission for all products in this timestep
  new Attribute(
    getTotalAttributeId(BaseIDs.total_co2_emission),
    block,
    (timestep) => {
      let total = 0;
      for (const product of Object.keys(
        simulation.input.products
      ) as Products[]) {
        total += timestep
          .getBlock(BlockType.PRODUCT, { product })
          .getAttribute(getProdAttrId(product, ProductBaseIDs.co2Emission));
      }
      return simulation.applyModifier(
        total,
        getTotalAttributeId(BaseIDs.total_co2_emission),
        timestep
      );
    }
  );

  // Calculate total CO2 tax cost for all products in this timestep
  new Attribute(
    getTotalAttributeId(BaseIDs.total_co2_tax_cost),
    block,
    (timestep) => {
      let total = 0;
      for (const product of Object.keys(
        simulation.input.products
      ) as Products[]) {
        total += timestep
          .getBlock(BlockType.PRODUCT, { product })
          .getAttribute(getProdAttrId(product, ProductBaseIDs.co2TaxCost));
      }
      return simulation.applyModifier(
        total,
        getTotalAttributeId(BaseIDs.total_co2_tax_cost),
        timestep
      );
    }
  );

  // For each material, calculate total consumed and total cost
  for (const material of Object.keys(
    simulation.input.materials
  ) as Materials[]) {
    // Calculate total consumed for this material across all products
    new Attribute(
      getTotalAttributeId(BaseIDs.total_consumed, material),
      block,
      (timestep) => {
        let total = 0;
        for (const product of Object.keys(
          simulation.input.products
        ) as Products[]) {
          total += timestep
            .getBlock(BlockType.PRODUCT, { product })
            .getAttribute(
              getProdAttrId(product, ProductBaseIDs.materialUse, material)
            );
        }
        return simulation.applyModifier(
          total,
          getTotalAttributeId(BaseIDs.total_consumed, material),
          timestep
        );
      }
    );

    // Calculate total cost for this material across all products
    new Attribute(
      getTotalAttributeId(BaseIDs.total_cost, material),
      block,
      (timestep) => {
        let total = 0;
        for (const product of Object.keys(
          simulation.input.products
        ) as Products[]) {
          total += timestep
            .getBlock(BlockType.PRODUCT, { product })
            .getAttribute(
              getProdAttrId(product, ProductBaseIDs.materialCost, material)
            );
        }
        return simulation.applyModifier(
          total,
          getTotalAttributeId(BaseIDs.total_cost, material),
          timestep
        );
      }
    );
  }

  // Calculate total material costs (sum of all individual material costs)
  new Attribute(
    getTotalAttributeId(BaseIDs.total_material_costs),
    block,
    (timestep) => {
      let totalMaterialCosts = 0;
      for (const material of Object.keys(
        simulation.input.materials
      ) as Materials[]) {
        totalMaterialCosts += block.getAttribute(
          getTotalAttributeId(BaseIDs.total_cost, material)
        );
      }
      return simulation.applyModifier(
        totalMaterialCosts,
        getTotalAttributeId(BaseIDs.total_material_costs),
        timestep
      );
    }
  );

  // Calculate total of all costs (total material costs + energy cost + CO2 tax cost)
  new Attribute(
    getTotalAttributeId(BaseIDs.total_all_costs),
    block,
    (timestep) => {
      // Add all costs together
      const totalCost =
        block.getAttribute(getTotalAttributeId(BaseIDs.total_material_costs)) +
        block.getAttribute(getTotalAttributeId(BaseIDs.total_energy_cost)) +
        block.getAttribute(getTotalAttributeId(BaseIDs.total_co2_tax_cost));

      return simulation.applyModifier(
        totalCost,
        getTotalAttributeId(BaseIDs.total_all_costs),
        timestep
      );
    }
  );
}
