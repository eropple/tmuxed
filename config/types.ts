import { Type } from "../deps.ts";
import { ConfigV1, DirectiveV1, PaneV1, WindowV1 } from './v1.ts';

export type ConfigAny =
  | ConfigV1;
export const ConfigAny = Type.Union([
  ConfigV1,
]);

export type ConfigLatest = ConfigV1;
export const ConfigLatest = ConfigV1;

export type WindowLatest = WindowV1;
export const WindowLatest = WindowV1; 

export type PaneLatest = PaneV1;
export const PaneLatest = PaneV1;

export type DirectiveLatest = DirectiveV1;
export const DirectiveLatest = DirectiveV1;

export type UpgradeFn<T> = (cfg: T) => ConfigLatest;
