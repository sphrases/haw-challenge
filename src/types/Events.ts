import { Directions } from "../types/MovementTypes";

/** Create events as enum to get consistency everywhere */

enum CustomGameEvents {
  StartGame = "StartGame",
  GameOver = "GameOver",
  EnemyCollision = "EnemyCollision",
  ControlInput = "ControlInput",
}

interface GameControlEvent extends Event {
  detail: {
    dir: Directions;
  };
}

export { CustomGameEvents };
export type { GameControlEvent };
