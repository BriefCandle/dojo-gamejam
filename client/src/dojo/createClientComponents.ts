import { defineComponent, overridableComponent, Type } from "@dojoengine/recs";

import { ContractComponents } from "./typescript/models.gen";
import { world } from "./world";

export type ClientComponents = ReturnType<typeof createClientComponents>;

export function createClientComponents({
  contractComponents,
}: {
  contractComponents: ContractComponents;
}) {
  return {
    ...contractComponents,
    Position: overridableComponent(contractComponents.Position),
    Moves: overridableComponent(contractComponents.Moves),
    ToggledOn: defineComponent(world, {
      value: Type.Boolean,
    }),
    NikkeAttack: defineComponent(world, {
      attackType: Type.Entity,
      // target: Type.Entity,
    }),
    SelectedHost: defineComponent(world, {
      value: Type.Entity,
    }),
  };
}
