import {
  defineSystem,
  Entity,
  getComponentValue,
  Has,
  HasValue,
  NotValue,
  removeComponent,
  setComponent,
  UpdateType,
} from "@dojoengine/recs";
import { SetupResult } from "../../dojo/setup";
import { SpineGameObject } from "@esotericsoftware/spine-phaser";
import { BurnerAccount } from "@dojoengine/create-burner";
import { Account } from "starknet";
import { nikkeNameMap, TARGET } from "../../constants";
import { Nikke } from "../objects/Nikke";
import { Enemy } from "../objects/Enemy";
import { toHex } from "viem";

export class GameScene extends Phaser.Scene {
  account?: Account;
  network: SetupResult["client"];
  components: SetupResult["clientComponents"];
  systemCalls: SetupResult["systemCalls"];

  nikkes: Record<Entity, Nikke> = {};
  enmies: Record<Entity, Enemy> = {};

  constructor(
    setupResult: SetupResult,
    config?: Phaser.Types.Scenes.SettingsConfig
  ) {
    super({ ...config, key: "GameScene", active: true });
    this.network = setupResult.client;
    this.components = setupResult.clientComponents;
    this.systemCalls = setupResult.systemCalls;
    this.account = setupResult.burnerManager.account ?? undefined;
  }

  preload() {
    // load nikke spine assets
    const nikkePath = "src/assets/nikke";
    nikkeNameMap.forEach((nikke) => {
      this.load.spineBinary(
        `${nikke.name}_skel`,
        `${nikkePath}/${nikke.path}_00/${nikke.path}_00.skel`
      );
      this.load.spineAtlas(
        `${nikke.name}_atlas`,
        `${nikkePath}/${nikke.path}_00/${nikke.path}_00.atlas`
      );
      this.load.spineBinary(
        `${nikke.name}_aim_skel`,
        `${nikkePath}/${nikke.path}_00/${nikke.path}_aim_00.skel`
      );
      this.load.spineAtlas(
        `${nikke.name}_aim_atlas`,
        `${nikkePath}/${nikke.path}_00/${nikke.path}_aim_00.atlas`
      );
      this.load.spineBinary(
        `${nikke.name}_cover_skel`,
        `${nikkePath}/${nikke.path}_00/${nikke.path}_cover_00.skel`
      );
      this.load.spineAtlas(
        `${nikke.name}_cover_atlas`,
        `${nikkePath}/${nikke.path}_00/${nikke.path}_cover_00.atlas`
      );
    });

    // load enemy spine assets
    const enemyPath = `${nikkePath}/bbg003_00`;
    this.load.spineBinary("enemy_skel", `${enemyPath}/bbg003_00.skel`);
    this.load.spineAtlas("enemy_atlas", `${enemyPath}/bbg003_00.atlas`);
  }

  create() {
    const { world } = this.network;
    const { Hero } = this.components;

    // create players own nikke
    defineSystem(
      world,
      [HasValue(Hero, { commander: BigInt(this.account?.address ?? 0n) })],
      ({ entity, type }) => {
        this.nikkes[entity] = new Nikke(
          this,
          this.components,
          this.network,
          entity
        );
      }
    );

    // create an enemy
    defineSystem(
      world,
      [
        Has(Hero),
        NotValue(Hero, { commander: BigInt(this.account?.address ?? 0n) }),
      ],
      ({ entity, type }) => {
        if (type == UpdateType.Exit) return;
        if (Object.keys(this.enmies).length > 1) return;
        const heroId = toHex(getComponentValue(Hero, entity)!.heroId) as Entity;
        this.enmies[heroId] = new Enemy(this, this.components, this.network, {
          enemy: heroId,
          // onClick: (enemy) => {
          //   this.targetSelectHandler(enemy);
          // },
        });
      }
    );
  }

  targetSelectHandler(entity: Entity) {
    const { SelectedHost } = this.components;
    if (getComponentValue(SelectedHost, TARGET)?.value === entity) {
      removeComponent(SelectedHost, TARGET);
    } else {
      setComponent(SelectedHost, TARGET, {
        value: entity,
      });
    }
  }
}
