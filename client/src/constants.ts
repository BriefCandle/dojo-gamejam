import { Entity } from "@dojoengine/recs";
import { hexToString, toHex } from "viem";

export const OVERLAY = toHex("OVERLAY", { size: 31 }) as Entity;
export const TARGET = toHex("TARGET", { size: 31 }) as Entity;
