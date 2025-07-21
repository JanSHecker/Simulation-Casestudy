import { Simulation } from "./simulation";

console.log("Starting simulation...");
let simulation = new Simulation("simulation1");
simulation.run();
console.log("Simulation completed.");
simulation.storeResults();
