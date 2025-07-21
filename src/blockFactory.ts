import { Block, BlockType, BlockOptions } from "./block";
import { Attribute } from "./attribute";
import { Timestep } from "./timestep";
import { Materials, Products, Simulation } from "./simulation";
import { initializeMaterialBlock } from "./BlockDefinitions/MaterialBlock";
import { initializeProductionBlock } from "./BlockDefinitions/ProductionBlock";
import { initializeEnergyBlock } from "./BlockDefinitions/EnergyBlock";
import { initializeLegalBlock } from "./BlockDefinitions/LegalBlock";
import { initializeProductBlock } from "./BlockDefinitions/ProductBlock";
import { initializeStorageBlock } from "./BlockDefinitions/StorageBlock";
import { initializeTotalBlock } from "./BlockDefinitions/TotalBlock";

export class BlockFactory {
  constructor(private simulation: Simulation) {}

  createBlock(
    type: BlockType,
    id: string,
    timestep: Timestep,
    options: BlockOptions = {}
  ): Block {
    const block = new Block(id, timestep);

    switch (type) {
      case BlockType.PRODUCTION:
        if (!options.product)
          throw new Error("Product required for Production block");
        initializeProductionBlock(block, options.product, this.simulation);
        break;
      case BlockType.ENERGY:
        initializeEnergyBlock(block, this.simulation);
        break;
      case BlockType.MATERIAL:
        if (!options.material)
          throw new Error("Material required for Material block");
        initializeMaterialBlock(block, options.material, this.simulation);
        break;
      case BlockType.PRODUCT:
        if (!options.product)
          throw new Error("Product required for Product block");
        initializeProductBlock(block, options.product, this.simulation);
        break;
      case BlockType.STORAGE:
        if (!options.product)
          throw new Error("Product required for Storage block");
        initializeStorageBlock(block, options.product, this.simulation);
        break;
      case BlockType.LEGAL:
        initializeLegalBlock(block, this.simulation);
        break;
      case BlockType.TOTAL:
        initializeTotalBlock(block, this.simulation);
        break;
    }

    return block;
  }
}
