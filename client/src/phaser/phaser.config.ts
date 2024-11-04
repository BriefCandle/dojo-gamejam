import Phaser from "phaser";
import { SpinePlugin } from "@esotericsoftware/spine-phaser";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.WEBGL,
  premultipliedAlpha: true,
  parent: "phaser-container",
  backgroundColor: "#808080", //#808080 for gray background
  scale: {
    mode: Phaser.Scale.ScaleModes.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  disableContextMenu: true,
  audio: {
    disableWebAudio: false,
  },
  pixelArt: true,
  roundPixels: true,
  plugins: {
    scene: [
      { key: "spine.SpinePlugin", plugin: SpinePlugin, mapping: "spine" },
    ],
  },
};

export default config;
