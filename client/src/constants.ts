import { Entity } from "@dojoengine/recs";
import { hexToString, toHex } from "viem";

export const OVERLAY = toHex("OVERLAY", { size: 31 }) as Entity;

export const nikkeNameMap = [
  { name: "viper", path: "c112" },
  { name: "volume", path: "c431" },
  { name: "aria", path: "c432" },
  // { name: "twoB", path: "c810" },
];

// attack types
export const PRAYNSPRAY = toHex("PRAYNSPRAY", { size: 31 }) as Entity;
export const SHARPSHOOT = toHex("SHARPSHOOT", { size: 31 }) as Entity;

export const TARGET = toHex("TARGET", { size: 31 }) as Entity;
