import {
  defineSystem,
  Entity,
  getComponentValue,
  Has,
  HasValue,
  removeComponent,
  setComponent,
  UpdateType,
} from "@dojoengine/recs";
import { SetupResult } from "../../dojo/setup";
import { SpineGameObject } from "@esotericsoftware/spine-phaser";
import { TARGET } from "../../constants";
import { Hex, hexToString } from "viem";

export class Enemy {
  scene: Phaser.Scene;
  components: SetupResult["clientComponents"];
  network: SetupResult["client"];

  enemy: Entity;
  health: number;
  mana: number;

  enemySpine: SpineGameObject;

  damageTexts: Phaser.GameObjects.Text[] = [];

  selected = false;
  selectedOutline?: Phaser.GameObjects.Graphics;

  constructor(
    scene: Phaser.Scene,
    components: SetupResult["clientComponents"],
    network: SetupResult["client"],
    { enemy, onClick }: { enemy: Entity; onClick?: (enemy: Entity) => void }
  ) {
    this.scene = scene;
    this.components = components;
    this.network = network;
    const { AttackEvent, Hero } = this.components;
    const { world } = this.network;

    this.enemy = enemy;
    const hero = getComponentValue(Hero, enemy);
    this.health = hero?.health ?? 0;
    this.mana = hero?.mana ?? 0;
    console.log("enemy", this.health, this.mana);

    const x = (this.scene.scale.width / 3) * 2;
    const y = (this.scene.scale.height / 4) * 2;
    this.enemySpine = this.scene.add
      .spine(x, y, "enemy_skel", "enemy_atlas")
      .setOrigin(0.5, 0.5)
      .setScale(0.1);
    this.enemySpine.animationState.setAnimation(1, "idle", true);

    this.enemySpine.setInteractive();
    this.enemySpine.on("pointerdown", () => {
      // onClick?.(this.enemy);
      console.log("enemy clicked");
      this.selectedOutline ? this.unselect() : this.select();
    });

    defineSystem(
      world,
      [Has(AttackEvent)],
      ({ entity, type }) => {
        if (type === UpdateType.Exit) return;
        const attackEvent = getComponentValue(AttackEvent, entity)!;
        if (attackEvent.targetId !== BigInt(this.enemy)) return;
        const { prevHealth, currHealth, attackType } = attackEvent;
        // 4000 delay time is from Nikke's super attack animation
        const delayTime =
          hexToString(attackType as Hex) === "superAttack" ? 4000 : 0;
        this.scene.time.delayedCall(delayTime, () => {
          this.renderDamageText(prevHealth - currHealth);
        });
      },
      { runOnInit: false }
    );
  }

  renderDamageText(damage: number) {
    const x = this.enemySpine.x;
    const y = this.enemySpine.y - 120;
    const numberOfTexts = 10; // Number of damage texts to create
    const deviationRange = 30; // Range for random deviation
    const interval = 100; // Interval between each text in milliseconds

    for (let i = 0; i < numberOfTexts; i++) {
      this.scene.time.delayedCall(i * interval, () => {
        const randomX =
          x + Phaser.Math.Between(-deviationRange, deviationRange);
        const randomY =
          y + Phaser.Math.Between(-deviationRange, deviationRange);

        const text = this.scene.add
          .text(randomX, randomY, `-${damage}`, { color: "#ff0000" })
          .setScale(2)
          .setDepth(5)
          .setOrigin(0.5, 0.5);

        this.damageTexts.push(text);

        this.scene.tweens.add({
          targets: text,
          y: randomY - 20,
          duration: 500,
          onComplete: () => {
            text.destroy();
            this.damageTexts = this.damageTexts.filter((t) => t !== text);
          },
        });
      });
    }
  }

  select(color = 0xff0000) {
    this.selectedOutline?.destroy();
    const x = this.enemySpine.x;
    const y = this.enemySpine.y;
    const size = 100;
    const rect = new Phaser.Geom.Rectangle(-size / 2, -size, size, size);
    this.selectedOutline = this.scene.add
      .graphics()
      .lineStyle(5, color)
      .strokeRectShape(rect)
      .setPosition(x, y)
      .setDepth(5);
    setComponent(this.components.SelectedHost, TARGET, { value: this.enemy });
  }

  unselect() {
    if (!this.selectedOutline) return;
    this.selectedOutline?.destroy();
    this.selectedOutline = undefined;
    removeComponent(this.components.SelectedHost, TARGET);
  }
}
