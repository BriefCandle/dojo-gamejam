import {
  defineSystem,
  Entity,
  getComponentValue,
  Has,
  HasValue,
  UpdateType,
} from "@dojoengine/recs";
import { SetupResult } from "../../dojo/setup";
import { SpineGameObject } from "@esotericsoftware/spine-phaser";
import { PRAYNSPRAY, SHARPSHOOT } from "../../constants";

export class Nikke {
  scene: Phaser.Scene;
  components: SetupResult["clientComponents"];
  network: SetupResult["client"];

  nikke: Entity;
  index: number;
  isPlayer: boolean;

  isCovered: boolean;

  coverSpine: SpineGameObject;
  aimSpine: SpineGameObject;

  constructor(
    scene: Phaser.Scene,
    components: SetupResult["clientComponents"],
    network: SetupResult["client"],
    nikke: Entity,
    index: number,
    isPlayer?: boolean
  ) {
    this.scene = scene;
    this.components = components;
    this.network = network;

    this.nikke = nikke;
    this.index = index;
    this.isPlayer = isPlayer ?? true;

    const x = (this.scene.scale.width / 5) * (this.index + 1);
    // Align with the bottom of the screen
    const y = (this.scene.scale.height / 4) * 4 - 50;
    this.coverSpine = this.scene.add
      .spine(
        this.scene.scale.width / 4, // Align with the left of the screen
        (this.scene.scale.height / 4) * 4, // Align with the bottom of the screen
        `${nikkeType}_cover_skel`,
        `${nikkeType}_cover_atlas`
      )
      .setOrigin(0, 1)
      .setScale(0.18)
      .setDepth(1)
      .setVisible(false);
    this.aimSpine = this.scene.add
      .spine(x, y, `${nikkeType}_aim_skel`, `${nikkeType}_aim_atlas`)
      .setOrigin(0, 1)
      .setDepth(1)
      .setScale(0.18)
      .setVisible(false);

    const { HeroCovered, NikkeAttack } = this.components;

    this.isCovered =
      getComponentValue(HeroCovered, this.nikke)?.isCovered ?? false;
    this.isCovered ? this.startCoverSpine() : this.startAimSpine();

    const { world } = this.network;

    // manage aim <-> cover
    defineSystem(world, [Has(HeroCovered)], ({ entity, type }) => {
      if (entity !== this.nikke) return;
      this.isCovered =
        getComponentValue(HeroCovered, entity)?.isCovered ?? false;
      this.isCovered
        ? this.aimToCover(this.aimSpine, this.coverSpine)
        : this.coverToAim(this.coverSpine, this.aimSpine);
    });

    defineSystem(world, [Has(NikkeAttack)], ({ entity, type }) => {
      if (type === UpdateType.Exit) return;
      if (entity !== this.nikke) return;
      const attackType = getComponentValue(NikkeAttack, entity)!.attackType;
      if (attackType === SHARPSHOOT) {
        this.aimToFire(this.aimSpine, 500);
      } else if (attackType === PRAYNSPRAY) {
        this.prayNSpray(this.coverSpine, this.aimSpine);
      }
    });
  }

  startCoverSpine() {
    this.aimSpine.setVisible(false);
    this.coverSpine.setVisible(true);
    this.coverSpine.animationState.setAnimation(0, "cover_idle", true);
  }

  startAimSpine() {
    this.coverSpine.setVisible(false);
    this.aimSpine.setVisible(true);
    this.aimSpine.animationState.setAnimation(0, "aim_idle", true);
  }

  coverToAim(coverSpine: SpineGameObject, aimSpine: SpineGameObject) {
    coverSpine.animationState.setAnimation(0, "to_aim", false);
    this.scene.time.delayedCall(200, () => {
      coverSpine.setVisible(false);
      coverSpine.animationState.setAnimation(0, "cover_idle", true);
      aimSpine.setVisible(true);
      aimSpine.animationState.setAnimation(0, "aim_idle", true);
    });
  }

  prayNSpray(coverSpine: SpineGameObject, aimSpine: SpineGameObject) {
    this.coverToAimFire(coverSpine, aimSpine);
    this.scene.time.delayedCall(1000, () => {
      this.aimToCover(aimSpine, coverSpine);
    });
  }

  coverToAimFire(coverSpine: SpineGameObject, aimSpine: SpineGameObject) {
    coverSpine.animationState.setAnimation(0, "to_aim", false);
    this.scene.time.delayedCall(200, () => {
      coverSpine.setVisible(false);
      // set back animatio so that won't flesh when it's visible again
      coverSpine.animationState.setAnimation(0, "cover_idle", true);
      // coverSpine.setActive(false);
      aimSpine.setVisible(true);
      aimSpine.animationState.setAnimation(0, "aim_fire", true);
    });
  }

  coverToReload(coverSpine: SpineGameObject, duration: number) {
    coverSpine.animationState.setAnimation(0, "cover_reload", true);
    this.scene.time.delayedCall(duration, () => {
      coverSpine.animationState.setAnimation(0, "cover_idle", true);
    });
  }

  // duration in miliseconds
  aimToFire(aimSpine: SpineGameObject, duration: number) {
    aimSpine.animationState.setAnimation(0, "aim_fire", true);
    this.scene.time.delayedCall(duration, () => {
      aimSpine.animationState.setAnimation(0, "aim_idle", true);
    });
  }

  aimToCover(aimSpine: SpineGameObject, coverSpine: SpineGameObject) {
    aimSpine.animationState.setAnimation(0, "to_cover", false);
    this.scene.time.delayedCall(200, () => {
      aimSpine.setVisible(false);
      aimSpine.animationState.setAnimation(0, "aim_idle", true);
      // coverSpine.animationState.setAnimation(0, "cover_reload", true);
      coverSpine.setVisible(true);
      coverSpine.animationState.setAnimation(0, "cover_idle", true);
    });
  }

  destroy() {
    this.coverSpine.destroy();
    this.aimSpine.destroy();
  }
}
