import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { dojoConfig } from "../dojoConfig.ts";
import { DojoProvider } from "./dojo/DojoContext.tsx";
import { setup } from "./dojo/setup.ts";
import Phaser from "phaser";
import { GameScene } from "./phaser/scenes/GameScene.tsx";
import config from "./phaser/phaser.config.ts";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("React root not found");
const root = ReactDOM.createRoot(rootElement);

// Render the loader initially
root.render(
  <div className="bg-black text-white p-20 h-screen w-screen">Loading....</div>
);

// Perform setup and then render the app
setup(dojoConfig)
  .then((setupResult) => {
    if (!setupResult) {
      // Optionally update the loader or show an error
      root.render(
        <div className="bg-black text-white p-20 h-screen w-screen">
          Loading....
        </div>
      );
      return;
    }

    new Phaser.Game({
      ...config,
      scene: [new GameScene(setupResult)],
    });

    root.render(
      <React.StrictMode>
        <DojoProvider value={setupResult}>
          <App />
        </DojoProvider>
      </React.StrictMode>
    );
  })
  .catch((error) => {
    console.error("Initialization failed:", error);
    root.render(
      <div className="bg-black text-white p-20 h-screen w-screen">
        Initialization failed
      </div>
    );
  });
