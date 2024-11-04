import { World } from "@dojoengine/recs";
import { Account } from "starknet";

import { ClientComponents } from "./createClientComponents";
import type { IWorld } from "./typescript/contracts.gen";
import { Direction } from "./typescript/models.gen";
import { stringToBytes, stringToHex } from "viem";
import { stringToBytes16, stringToBytes32 } from "@latticexyz/utils";

export type SystemCalls = ReturnType<typeof createSystemCalls>;

export function createSystemCalls(
  { client }: { client: IWorld },
  { Position, Moves }: ClientComponents,
  world: World
) {
  const changeCovered = async (account: Account, heroId: bigint) => {
    try {
      await client.actions.changeCovered({
        account,
        heroId,
      });
    } catch (e) {
      console.log(e);
    }
  };

  const superAttack = async (
    account: Account,
    heroId: bigint,
    targetId: bigint
  ) => {
    try {
      await client.actions.superAttack({
        account,
        heroId,
        targetId,
      });
    } catch (e) {
      console.log(e);
    }
  };

  const sharpShoot = async (
    account: Account,
    heroId: bigint,
    targetId: bigint
  ) => {
    try {
      await client.actions.sharpShoot({
        account,
        heroId,
        targetId,
      });
    } catch (e) {
      console.log(e);
    }
  };

  const prayNSpray = async (
    account: Account,
    heroId: bigint,
    targetId: bigint
  ) => {
    try {
      await client.actions.prayNSpray({
        account,
        heroId,
        targetId,
      });
    } catch (e) {
      console.log(e);
    }
  };

  const mintHero = async (account: Account, heroType?: bigint) => {
    // for now, just mint a hero with a default type
    heroType = heroType || BigInt(0x111);
    try {
      await client.actions.mintHero({
        account,
        heroType,
      });
    } catch (e) {
      console.log(e);
    }
  };

  const spawn = async (account: Account) => {
    try {
      await client.actions.spawn({
        account,
      });
    } catch (e) {
      console.log(e);
    }
  };

  const move = async (account: Account, direction: Direction) => {
    try {
      await client.actions.move({
        account,
        direction,
      });
    } catch (e) {
      console.log(e);
    }
  };

  const initHeroType = async (account: Account) => {
    await client.actions.initHeroType({
      account,
      heroSpecs: {
        heroType: BigInt(stringToHex("Hero")),
        attack: 10,
        defense: 10,
        maxHealth: 100,
        maxMana: 100,
        critChance: 10,
        // skillTypes: [BigInt(10000)],
      },
    });
  };
  return {
    spawn,
    move,
    initHeroType,
    mintHero,
    prayNSpray,
    superAttack,
    sharpShoot,
    changeCovered,
  };
}
