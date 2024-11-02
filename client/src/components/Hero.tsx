import { useComponentValue, useEntityQuery } from "@dojoengine/react";
import { Entity, getComponentValue, Has, HasValue } from "@dojoengine/recs";
import { useDojo } from "../dojo/useDojo";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { toHex } from "viem";

export function Heroes() {
  const {
    clientComponents: { ToggledOn, HeroSpecs, Hero },
    toriiClient,
    contractComponents,
    client,
    systemCalls,
    account,
  } = useDojo();
  const playerId = BigInt(account?.account.address);
  // getEntityIdFromKeys([
  //   BigInt(account?.account.address),
  // ]) as Entity;
  // const heroes = useEntityQuery([Has(Hero)]);
  const playerHeroes = useEntityQuery([
    HasValue(Hero, { commander: playerId }),
  ]);
  if (!playerHeroes.length) return null;

  return (
    <div className="absolute pointer-events-auto bottom-2 left-2">
      <div className="flex flex-row space-x-10">
        {playerHeroes.map((hero, index) => (
          <div key={index}>
            <HeroStats hero={hero} />
            <HeroActions hero={hero} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function HeroStats({ hero }: { hero: Entity }) {
  const { clientComponents } = useDojo();
  const { Hero, HeroSpecs, EntityType } = clientComponents;
  const entityType = useComponentValue(EntityType, hero)?.entityType || 0n;
  const typeId = getEntityIdFromKeys([entityType]);
  const heroSpecs = useComponentValue(HeroSpecs, typeId);
  const heroInstance = useComponentValue(Hero, hero);
  if (!heroSpecs || !heroInstance) return null;
  const { heroType, attack, defense, maxHealth, maxMana, critChance } =
    heroSpecs;
  const { heroId, commander, exp, health, mana } = heroInstance;

  return (
    <div>
      {/* <div>{`Hero ID: ${heroId}`}</div> */}
      <div>
        HP: {health}/{maxHealth}
      </div>
      <div>
        MP: {mana}/{maxMana}
      </div>
    </div>
  );
}

export function HeroActions({ hero }: { hero: Entity }) {
  const {
    clientComponents: { HeroCovered, Hero },
    toriiClient,
    contractComponents,
    client,
    systemCalls,
    account,
  } = useDojo();

  const playerId = BigInt(account?.account.address);
  const isPlayer = useComponentValue(Hero, hero)?.commander === playerId;
  const isCovered = useComponentValue(HeroCovered, hero)?.isCovered ?? false;
  const heroId = getComponentValue(Hero, hero)?.heroId;
  console.log("heroId", heroId, hero, BigInt(hero));
  console.log("isPlayer", isPlayer, isCovered);
  if (!isPlayer) return null;
  return (
    <div>
      <button
        onClick={() => {
          const heroId = getComponentValue(Hero, hero)?.heroId;
          if (!heroId) return;
          const isCommander =
            getComponentValue(Hero, hero)?.commander === playerId;
          console.log(
            "take cover",
            account.account.address,
            toHex(heroId),
            toHex(
              2562296894513420311221999417888358590652528187021096120884908101177557051056n
            )
          );
          systemCalls.changeCovered(account.account, heroId);
        }}
        className="btn-blue"
      >
        {isCovered ? "Aim" : "Take Cover"}
      </button>
    </div>
  );
}
