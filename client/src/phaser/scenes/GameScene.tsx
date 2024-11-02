import { defineSystem, HasValue } from "@dojoengine/recs";
import { SetupResult } from "../../dojo/setup";
import { SpineGameObject } from "@esotericsoftware/spine-phaser";
import { BurnerAccount } from "@dojoengine/create-burner";
import { Account } from "starknet";

export class GameScene extends Phaser.Scene {
  account?: Account;
  network: SetupResult["client"];
  components: SetupResult["clientComponents"];
  systemCalls: SetupResult["systemCalls"];

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
    const nikkePath = "src/assets/nikke";
    const viperPath = `${nikkePath}/c112_00`;
    this.load.spineBinary("viper_skel", `${viperPath}/c112_00.skel`);
    this.load.spineAtlas("viper_atlas", `${viperPath}/c112_00.atlas`);
    this.load.spineBinary("viper_aim_skel", `${viperPath}/c112_aim_00.skel`);
    this.load.spineAtlas("viper_aim_atlas", `${viperPath}/c112_aim_00.atlas`);
    this.load.spineBinary(
      "viper_cover_skel",
      `${viperPath}/c112_cover_00.skel`
    );
    this.load.spineAtlas(
      "viper_cover_atlas",
      `${viperPath}/c112_cover_00.atlas`
    );
    // load volume, c431
    const volumePath = `${nikkePath}/c431_00`;
    this.load.spineBinary("volume_skel", `${volumePath}/c431_00.skel`);
    this.load.spineAtlas("volume_atlas", `${volumePath}/c431_00.atlas`);
    this.load.spineBinary("volume_aim_skel", `${volumePath}/c431_aim_00.skel`);
    this.load.spineAtlas("volume_aim_atlas", `${volumePath}/c431_aim_00.atlas`);
    this.load.spineBinary(
      "volume_cover_skel",
      `${volumePath}/c431_cover_00.skel`
    );
    this.load.spineAtlas(
      "volume_cover_atlas",
      `${volumePath}/c431_cover_00.atlas`
    );
    // // load 2b
    // const twoBPath = `${nikkePath}/c810_00`;
    // this.load.spineBinary("twoB_skel", `${twoBPath}/c810_00.skel`);
    // this.load.spineAtlas("twoB_atlas", `${twoBPath}/c810_00.atlas`, false);
    // load enemy bbg003
    const enemyPath = `${nikkePath}/bbg003_00`;
    this.load.spineBinary("enemy_skel", `${enemyPath}/bbg003_00.skel`);
    this.load.spineAtlas("enemy_atlas", `${enemyPath}/bbg003_00.atlas`);
  }

  create() {
    const enemy = this.add
      .spine(
        (this.scale.width / 3) * 2,
        (this.scale.height / 4) * 2,
        "enemy_skel",
        "enemy_atlas"
      )
      .setOrigin(0, 1)
      .setScale(0.2);
    enemy.animationState.setAnimation(1, "idle", true);

    // Log all animation keys for the enemy skeleton
    const enemyAnimations = enemy.skeleton.data.animations;
    enemyAnimations.forEach((animation) => {
      console.log(`Animation name: ${animation.name}`);
    });

    // init viper cover and aim
    const viper_cover = this.add
      .spine(
        this.scale.width / 3, // Align with the left of the screen
        (this.scale.height / 4) * 3, // Align with the bottom of the screen
        "viper_cover_skel",
        "viper_cover_atlas"
      )
      .setOrigin(0, 1)
      .setScale(0.2);
    const viper_aim = this.add
      .spine(
        this.scale.width / 3,
        (this.scale.height / 4) * 3,
        "viper_aim_skel",
        "viper_aim_atlas"
      )
      .setOrigin(0, 1)
      .setScale(0.2)
      .setVisible(false);

    viper_cover.animationState.setAnimation(0, "cover_idle", true);
    // this.time.delayedCall(2000, () => {
    //   this.coverToAimFire(viper_cover, viper_aim);
    // });

    this.time.delayedCall(1000, () => {
      this.coverToAimFire(viper_cover, viper_aim);
      this.time.delayedCall(1000, () => {
        this.aimToCoverReload(viper_aim, viper_cover);
      });
    });

    const { world } = this.network;

    defineSystem(world, [HasValue()]);
  }

  // from cover to aim is triggered by a click event
  coverToAimFire(coverSpine: SpineGameObject, aimSpine: SpineGameObject) {
    coverSpine.animationState.setAnimation(0, "to_aim", false);
    this.time.delayedCall(200, () => {
      coverSpine.setVisible(false);
      // set back animatio so that won't flesh when it's visible again
      coverSpine.animationState.setAnimation(0, "cover_idle", true);
      // coverSpine.setActive(false);
      aimSpine.setVisible(true);
      aimSpine.animationState.setAnimation(0, "aim_fire", true);
    });
  }

  aimToCoverReload(aimSpine: SpineGameObject, coverSpine: SpineGameObject) {
    aimSpine.animationState.setAnimation(0, "to_cover", false);
    this.time.delayedCall(200, () => {
      aimSpine.setVisible(false);
      aimSpine.animationState.setAnimation(0, "aim_idle", true);
      // coverSpine.animationState.setAnimation(0, "cover_reload", true);
      coverSpine.setVisible(true);
      coverSpine.animationState.setAnimation(0, "cover_idle", true);
    });
  }
}
