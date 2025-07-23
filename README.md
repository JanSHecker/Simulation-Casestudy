# Simulation Case Study

A TypeScript-based simulation system for modeling production, material costs, energy consumption, and economic scenarios with dynamic modifiers and conditional triggers.

## Overview

This simulation system uses a **block-based architecture** where different aspects of a production system (materials, products, storage, energy, legal constraints) are modeled as interconnected blocks. The system supports dynamic modifications through a trigger and modifier system.

## Architecture

### Core Components

#### 1. Blocks

The foundation of the simulation, representing different aspects of the system:

- **MaterialBlock**: Manages material costs, tariffs, and CO2 emissions
- **ProductBlock**: Tracks production units and revenue
- **ProductionBlock**: Handles production processes and resource consumption
- **StorageBlock**: Manages inventory and demand
- **EnergyBlock**: Calculates energy costs and consumption
- **LegalBlock**: Applies regulatory constraints like CO2 taxes
- **TotalBlock**: Aggregates system-wide metrics

#### 2. Dynamic Type System

Instead of hardcoded enums, the system uses dynamic types extracted from the configuration:

```typescript
export type Materials =
  (typeof input.materials)[keyof typeof input.materials]["id"];
export type Products =
  (typeof input.products)[keyof typeof input.products]["id"];
```

This allows for flexible material and product definitions via the `input.json` configuration file.

#### 3. Trigger System

Triggers define **when** modifiers should be applied. Three types are supported:

**Timestep Range Triggers**

```typescript
const priceTrigger = Trigger.createTimestepRange(10, 20); // Active from timestep 10-20
```

**Attribute Threshold Triggers**

```typescript
const demandTrigger = Trigger.createAttributeThreshold(
  "storage_widget",
  "demand",
  ComparisonOperator.GREATER_THAN,
  1000
);
```

**Combined Triggers**

```typescript
const complexTrigger = Trigger.createCombined(
  [
    { type: TriggerType.TIMESTEP_RANGE, minTimestep: 15 },
    {
      type: TriggerType.ATTRIBUTE_THRESHOLD,
      blockId: "total",
      attributeId: "total_costs",
      operator: ComparisonOperator.GREATER_THAN,
      value: 50000,
    },
  ],
  LogicalOperator.AND
);
```

#### 4. Modifier System

Modifiers define **how** values should be changed when their triggers activate:

**Modifier Modes:**

- `ABSOLUTE`: Adds a fixed value (`base + modifier`)
- `RELATIVE`: Multiplies by a factor (`base * modifier`)
- `SET`: Sets to a specific value
- `DELAY`: Delays an value to future timesteps

## How It Works

### Simulation Flow

1. **Initialization**: Creates blocks for each material, product, and system component
2. **Timestep Processing**: For each timestep:
   - Calculate all block attributes
   - Apply active modifiers based on trigger conditions
   - Store results
3. **Output**: Generates JSON files with complete simulation results

## Development

### Building

```bash
pnpm build
```

### Running

```bash
pnpm dev
```
