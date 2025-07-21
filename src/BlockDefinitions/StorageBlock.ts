import { Block, BlockType } from "../block";
import { Attribute } from "../attribute";
import { Simulation, Products } from "../simulation";
import {
  getProductAttributeId,
  BaseIDs as ProductBaseIDs,
} from "./ProductBlock";

enum BaseIDs {
  unitsInStorage = "unitsInStorage",
  baseDemand = "baseDemand",
  demand = "demand",
  delayedDemand = "delayedDemand",
  sold = "sold",
}

function getStorageAttributeId(product: Products, baseId: BaseIDs): string {
  return `${product}_${baseId}`;
}

export function initializeStorageBlock(
  block: Block,
  product: Products,
  simulation: Simulation
) {
  const productData = simulation.input.products[product];

  // Base demand from input
  // Formula: baseDemand = input.products[product].baseDemand
  new Attribute(
    getStorageAttributeId(product, BaseIDs.baseDemand),
    block,
    (timestep) =>
      simulation.applyModifier(
        productData.baseDemand,
        getStorageAttributeId(product, BaseIDs.baseDemand),
        timestep
      )
  );

  // Calculate total demand including delayed demand from previous timestep
  // Formula: demand = baseDemand + previous_timestep.delayedDemand
  new Attribute(
    getStorageAttributeId(product, BaseIDs.demand),
    block,
    (timestep) => {
      const previousDelayedDemand =
        timestep.step === 0
          ? 0
          : simulation.timesteps[timestep.step - 1]
              .getBlock(BlockType.STORAGE, { product })
              .getAttribute(
                getStorageAttributeId(product, BaseIDs.delayedDemand)
              );

      return simulation.applyModifier(
        block.getAttribute(getStorageAttributeId(product, BaseIDs.baseDemand)) +
          previousDelayedDemand,
        getStorageAttributeId(product, BaseIDs.demand),
        timestep
      );
    }
  );

  // Calculate units in storage
  // Formula: unitsInStorage = previous_timestep.unitsInStorage - previous_timestep.sold + current_timestep.producedUnits
  new Attribute(
    getStorageAttributeId(product, BaseIDs.unitsInStorage),
    block,
    (timestep) => {
      const previousStorage =
        timestep.step === 0
          ? 0
          : simulation.timesteps[timestep.step - 1]
              .getBlock(BlockType.STORAGE, { product })
              .getAttribute(
                getStorageAttributeId(product, BaseIDs.unitsInStorage)
              );

      const previousSold =
        timestep.step === 0
          ? 0
          : simulation.timesteps[timestep.step - 1]
              .getBlock(BlockType.STORAGE, { product })
              .getAttribute(getStorageAttributeId(product, BaseIDs.sold));

      return simulation.applyModifier(
        previousStorage -
          previousSold +
          block.timestep
            .getBlock(BlockType.PRODUCT, { product })
            .getAttribute(
              getProductAttributeId(product, ProductBaseIDs.producedUnits)
            ),
        getStorageAttributeId(product, BaseIDs.unitsInStorage),
        timestep
      );
    }
  );

  // Calculate how many units are actually sold (limited by demand and available storage)
  // Formula: sold = min(demand, unitsInStorage)
  new Attribute(
    getStorageAttributeId(product, BaseIDs.sold),
    block,
    (timestep) => {
      const currentDemand = block.getAttribute(
        getStorageAttributeId(product, BaseIDs.demand)
      );
      const availableStorage = block.getAttribute(
        getStorageAttributeId(product, BaseIDs.unitsInStorage)
      );

      return simulation.applyModifier(
        Math.min(currentDemand, availableStorage),
        getStorageAttributeId(product, BaseIDs.sold),
        timestep
      );
    }
  );

  // Calculate delayed demand
  // Formula: delayedDemand = demand - sold (if demand > sold, else 0)
  new Attribute(
    getStorageAttributeId(product, BaseIDs.delayedDemand),
    block,
    (timestep) => {
      const currentDemand = block.getAttribute(
        getStorageAttributeId(product, BaseIDs.demand)
      );
      const currentSold = block.getAttribute(
        getStorageAttributeId(product, BaseIDs.sold)
      );

      return simulation.applyModifier(
        Math.max(0, currentDemand - currentSold),
        getStorageAttributeId(product, BaseIDs.delayedDemand),
        timestep
      );
    }
  );
}
