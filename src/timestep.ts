import { Block, BlockType, BlockOptions } from "./block";
import { Simulation, Materials, Products } from "./simulation";
import { BlockFactory } from "./blockFactory";

export class Timestep {
  step: number;
  simulation: Simulation;

  blocks: { [key: string]: Block };
  constructor(step: number, simulation: Simulation) {
    this.step = step;
    this.simulation = simulation;
    this.blocks = {};
    this.initializeBlocks();
  }
  initializeBlocks() {
    let blockFactory = new BlockFactory(this.simulation);
    // Create energy and legal blocks
    this.blocks[BlockType.ENERGY] = blockFactory.createBlock(
      BlockType.ENERGY,
      BlockType.ENERGY,
      this
    );
    this.blocks[BlockType.LEGAL] = blockFactory.createBlock(
      BlockType.LEGAL,
      BlockType.LEGAL,
      this
    );

    // Create material blocks for each material
    (Object.keys(this.simulation.input.materials) as Materials[]).forEach(
      (material) => {
        const id = `${material}_${BlockType.MATERIAL}`;
        this.blocks[id] = blockFactory.createBlock(
          BlockType.MATERIAL,
          id,
          this,
          {
            material,
          }
        );
      }
    );

    // Create blocks for each product
    (Object.keys(this.simulation.input.products) as Products[]).forEach(
      (product) => {
        // Production block
        const productionId = `${product}_${BlockType.PRODUCTION}`;
        this.blocks[productionId] = blockFactory.createBlock(
          BlockType.PRODUCTION,
          productionId,
          this,
          { product }
        );

        // Product block
        const productId = `${product}_${BlockType.PRODUCT}`;
        this.blocks[productId] = blockFactory.createBlock(
          BlockType.PRODUCT,
          productId,
          this,
          { product }
        );

        // Storage block
        const storageId = `${product}_${BlockType.STORAGE}`;
        this.blocks[storageId] = blockFactory.createBlock(
          BlockType.STORAGE,
          storageId,
          this,
          { product }
        );
      }
    );
    // Create total block
    this.blocks[BlockType.TOTAL] = blockFactory.createBlock(
      BlockType.TOTAL,
      BlockType.TOTAL,
      this
    );
  }

  getBlock(type: BlockType, options: BlockOptions = {}): Block {
    let blockId: string;

    if (type === BlockType.ENERGY || type === BlockType.LEGAL) {
      blockId = type;
    } else if (options.material) {
      blockId = `${options.material}_${type}`;
    } else if (options.product) {
      blockId = `${options.product}_${type}`;
    } else {
      throw new Error(
        `Cannot get block of type ${type} without material or product specification`
      );
    }

    const block = this.blocks[blockId];
    if (!block) {
      throw new Error(`Block not found: ${blockId}`);
    }

    return block;
  }
}
