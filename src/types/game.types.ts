export type FieldSettingsType = {
  fieldW: number;
  fieldH: number;
}

export type GameSettingsType = {
  minPlayers: number;
  maxPlayers: number;
  ownerId: number;
  delayTime: number;
  endPlay: boolean;
  maxSpeedPhase: number;
  increasingVelPerScores: number;
  startSpeedPhaze: number;
  numApples: number;
}

export type Game = {
  gameId: number;
  gameSettings: GameSettingsType;
  fieldSettings: FieldSettingsType;
  players: Player[];
  winner: number;
  status: GameStatus;
  foods: Food[];
  timeGameStarted?: number;
}

export type GameStatus = 'in_process' | 'waiting';

export type Player = {
  userId: number;
  name: string;
  color: number[];
  snake: Snake;
  score: number;
  isReady: boolean;
  alive: boolean;
  speedPhase: number;
  phase: number;
  started: boolean;
}

export type Snake = {
  head: Cell;
  velx: number;
  vely: number;
  body: Cell[];
}

export type Cell = {
  x: number;
  y: number;
}

export type Food = {
  x: number;
  y: number;
  adds: number;
}

export enum Move {
  LEFT = 0, RIGHT = 1, UP = 2, DOWN = 3
}