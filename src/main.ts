import { Simulation, Materials, Products } from "./simulation";
import {
  steelPriceSpike,
  plasticTariffIncrease,
  newWidgetProductionProcess,
  gadgetProductionDelay,
  gadgetProductionIncrease,
} from "./sampleModifiers";

const NUMBER_OF_SIMULATIONS = 6;

console.log("Starting simulation...");
let all_simulations = [];
for (let i = 1; i <= NUMBER_OF_SIMULATIONS; i++) {
  all_simulations.push(new Simulation(`simulation${i}`));
}

// Apply sample modifiers to different simulations

all_simulations[1].addModifier(plasticTariffIncrease);
all_simulations[2].addModifier(steelPriceSpike);
all_simulations[3].addModifier(newWidgetProductionProcess);
all_simulations[4].addModifier(gadgetProductionDelay);
all_simulations[5].addModifier(gadgetProductionIncrease);

for (const simulation of all_simulations) {
  simulation.run();
  console.log(`Simulation ${simulation.id} completed.`);
  simulation.storeResults();
}
