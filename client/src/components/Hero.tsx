import { useComponentValue, useEntityQuery } from "@dojoengine/react";
import {
  Entity,
  getComponentValue,
  Has,
  HasValue,
  setComponent,
} from "@dojoengine/recs";
import { useDojo } from "../dojo/useDojo";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { toHex } from "viem";
import { PRAYNSPRAY, SHARPSHOOT, SUPERATTACK, TARGET } from "../constants";

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
    clientComponents: { HeroCovered, Hero, NikkeAttack, SelectedHost },
    toriiClient,
    contractComponents,
    client,
    systemCalls,
    account,
  } = useDojo();

  const playerId = BigInt(account?.account.address);
  const isPlayer = useComponentValue(Hero, hero)?.commander === playerId;
  const isCovered = useComponentValue(HeroCovered, hero)?.isCovered ?? false;

  const target = useComponentValue(SelectedHost, TARGET)?.value;

  if (!isPlayer) return null;
  return (
    <div>
      <button
        className="btn-blue"
        onClick={() => {
          const heroId = getComponentValue(Hero, hero)?.heroId;
          if (!heroId) return;
          const isCommander =
            getComponentValue(Hero, hero)?.commander === playerId;
          console.log("take cover", account.account.address, toHex(heroId));
          systemCalls.changeCovered(account.account, heroId);
        }}
      >
        {isCovered ? "Aim" : "Take Cover"}
      </button>
      {isCovered && (
        <button
          className="btn-blue"
          disabled={!target}
          onClick={() => {
            if (!target) return;
            const heroId = getComponentValue(Hero, hero)?.heroId;
            if (!heroId) return;
            setComponent(NikkeAttack, hero, {
              attackType: PRAYNSPRAY,
            });
            systemCalls.prayNSpray(account.account, heroId, BigInt(target));
          }}
        >
          Pray N Spray
        </button>
      )}
      {!isCovered && (
        <button
          className="btn-blue"
          disabled={!target}
          onClick={() => {
            if (!target) return;
            // const targetId = getComponentValue(Hero, target)?.heroId;
            // if (!targetId) return;
            const heroId = getComponentValue(Hero, hero)?.heroId;
            if (!heroId) return;
            setComponent(NikkeAttack, hero, { attackType: SHARPSHOOT });
            systemCalls.sharpShoot(account.account, heroId, BigInt(target));
          }}
        >
          Sharpshoot
        </button>
      )}
      <button
        className="btn-blue"
        disabled={!target}
        onClick={() => {
          if (!target) return;
          // const targetId = getComponentValue(Hero, target)?.heroId;
          // if (!targetId) return;
          const heroId = getComponentValue(Hero, hero)?.heroId;
          if (!heroId) return;
          setComponent(NikkeAttack, hero, { attackType: SUPERATTACK });
          systemCalls.superAttack(account.account, heroId, BigInt(target));
        }}
      >
        Super
      </button>
    </div>
  );
}
