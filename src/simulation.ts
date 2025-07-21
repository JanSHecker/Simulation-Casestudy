import { Modifier } from "./modifier";
import { Timestep } from "./timestep";
import input from "./input.json";
import * as fs from "fs";
import * as path from "path";

export class Simulation {
  id: string;
  modifiers: { [key: string]: Modifier[] };
  timesteps: Timestep[];
  input = input;

  constructor(id: string) {
    console.log("Simulation initialized with input:", input);
    this.id = id;
    this.modifiers = {};
    this.timesteps = [];
    for (let i = 0; i < this.input.numberOfTimesteps; i++) {
      this.timesteps.push(new Timestep(i, this));
    }
    console.log("Timesteps initialized:", this.timesteps.length);
  }
  //check if an active modifier exists for the attribute
  applyModifier(base: number, attribute: string): number {
    let value = base;
    if (this.modifiers[attribute]) {
      for (const modifier of this.modifiers[attribute]) {
        if (modifier.active) {
          value = modifier.apply(value);
        }
      }
    }

    return value;
  }

  run() {
    for (const timestep of this.timesteps) {
      //console.log(`Running timestep ${timestep.step}`);
      // Recalculate all attributes in the timestep
      for (const block of Object.values(timestep.blocks)) {
        for (const attribute of Object.values(block.attributes)) {
          attribute.calculate();
        }
      }
    }
  }
  storeResults() {
    // Store the results of the simulation as a JSON file
    const results = this.timesteps.map((timestep) => {
      return {
        step: timestep.step,
        blocks: Object.fromEntries(
          Object.entries(timestep.blocks).map(([id, block]) => [
            id,
            Object.fromEntries(
              Object.entries(block.attributes).map(([attrId, attr]) => [
                attrId,
                attr.value,
              ])
            ),
          ])
        ),
      };
    });
    const jsonResults = JSON.stringify(results, null, 2);

    // Create output folder if it doesn't exist
    const outputFolder = "output_folder";
    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder);
    }

    // Write to file with simulation ID in the output folder
    const filename = `output_${this.id}.json`;
    const filepath = path.join(outputFolder, filename);
    fs.writeFileSync(filepath, jsonResults);
    console.log(`Simulation results saved to ${filepath}`);
  }
}

// Derive types from the input.json structure
export type Materials = keyof typeof input.materials;
export type Products = keyof typeof input.products;
