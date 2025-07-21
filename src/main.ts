import { Simulation, Materials, Products } from "./simulation";
import {
  steelPriceSpike,
  plasticTariffIncrease,
  newWidgetProductionProcess,
  gadgetProductionDelay,
} from "./sampleModifiers";

console.log("Starting simulation...");
let all_simulations = [
  new Simulation("simulation1"),
  new Simulation("simulation2"),
  new Simulation("simulation3"),
  new Simulation("simulation4"),
  new Simulation("simulation5"),
];

// Apply sample modifiers to different simulations

all_simulations[1].addModifier(plasticTariffIncrease);
all_simulations[2].addModifier(steelPriceSpike);
all_simulations[3].addModifier(newWidgetProductionProcess);
all_simulations[4].addModifier(gadgetProductionDelay);

for (const simulation of all_simulations) {
  simulation.run();
  console.log(`Simulation ${simulation.id} completed.`);
  simulation.storeResults();
}
