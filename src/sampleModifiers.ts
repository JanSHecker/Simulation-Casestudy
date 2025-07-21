import input from "./input.json";
import { Modifier, ModifierMode } from "./modifier";
import { Trigger } from "./trigger";
import {
  getMaterialAttributeId,
  BaseIDs as MaterialBaseIDs,
} from "./BlockDefinitions/MaterialBlock";
import { Materials, Products } from "./simulation";
import {
  getProductionAttributeId,
  BaseIDs as ProductionBaseIDs,
} from "./BlockDefinitions/ProductionBlock";
import {
  getProductAttributeId,
  BaseIDs as ProductBaseIDs,
} from "./BlockDefinitions/ProductBlock";

// Example: Add a steel price increase that happens during timesteps 10-20
const priceSpikeTrigger = Trigger.createTimestepRange(10, 20);
const steelBasePriceID = getMaterialAttributeId(
  input.materials.steel.id as Materials,
  MaterialBaseIDs.basePrice
);
export const steelPriceSpike = new Modifier(
  "steel_price_crisis",
  steelBasePriceID,
  ModifierMode.RELATIVE,
  1.3, // 30% price increase
  priceSpikeTrigger
);

const plasticTariffIncreaseTrigger = Trigger.createTimestepRange(5, 15);
const plasticTariffID = getMaterialAttributeId(
  input.materials.plastic.id as Materials,
  MaterialBaseIDs.tariffRate
);
export const plasticTariffIncrease = new Modifier(
  "plastic_tariff_increase",
  plasticTariffID,
  ModifierMode.ABSOLUTE,
  0.2, // 20% tariff increase
  plasticTariffIncreaseTrigger
);

const newWidgetProductionProcessTrigger = Trigger.createTimestepRange(
  5,
  Infinity
);
export const newWidgetProductionProcess = new Modifier(
  "new_widget_production_process",
  getProductionAttributeId(
    input.products.widget.id as Products,
    ProductionBaseIDs.consumptionPerUnit,
    input.materials.steel.id as Materials
  ),
  ModifierMode.SET,
  1, // Set consumption to 1 unit of steel per widget
  newWidgetProductionProcessTrigger
);

const gadgetProductionDelayTrigger = Trigger.createTimestepRange(0, 5);
const gadgetProducedUnitsID = getProductAttributeId(
  input.products.gadget.id as Products,
  ProductBaseIDs.producedUnits
);
export const gadgetProductionDelay = new Modifier(
  "gadget_production_delay",
  gadgetProducedUnitsID,
  ModifierMode.DELAY,
  5, // Delay production by 5 timesteps
  gadgetProductionDelayTrigger
);
