export class Modifier {
  id: string;
  attribute: string;
  mode: "absolute" | "relative" | "set" | "delay";
  value: number;
  active: boolean;

  constructor(
    id: string,
    attribute: string,
    mode: string,
    value: number,
    active: boolean = true
  ) {
    this.id = id;
    this.attribute = attribute;
    this.mode = mode as "absolute" | "relative" | "set" | "delay";
    this.value = value;
    this.active = active;
  }
  apply(base: number): number {
    switch (this.mode) {
      case "absolute":
        return this.value + base;
      case "relative":
        return base * this.value;
      case "set":
        return this.value;
      case "delay":
        // Implement delay logic if needed
        return base; // Placeholder for delay logic
      default:
        throw new Error(`Unknown modifier mode: ${this.mode}`);
    }
  }
}
