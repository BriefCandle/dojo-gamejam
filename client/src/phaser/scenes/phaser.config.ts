import Phaser from "phaser";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.WEBGL,
  parent: "phaser-container",
  backgroundColor: "#1a103c",
  scale: {
    mode: Phaser.Scale.ScaleModes.RESIZE,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  pixelArt: true,
  disableContextMenu: true,
  audio: {
    disableWebAudio: false,
  },
  plugins: {
    scene: [],
  },
};

export default config;
