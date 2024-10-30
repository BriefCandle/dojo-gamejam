import { SetupResult } from "../../dojo/setup";

export class GameScene extends Phaser.Scene {
  constructor(
    setupResult: SetupResult,
    config?: Phaser.Types.Scenes.SettingsConfig
  ) {
    super({ ...config, key: "GameScene", active: true });
  }
}
