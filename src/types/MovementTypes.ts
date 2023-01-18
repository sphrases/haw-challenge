/** Types for movement */

type Directions = "Left" | "Right" | "Forwards"; // | "Backwards"

type MovementDirections = {
  [key in Directions]: boolean;
};

type AccelerationValueType = {
  [key in Directions]: number;
};

type SpeedValueType = {
  [key in Directions]: number;
};

export type {
  SpeedValueType,
  AccelerationValueType,
  MovementDirections,
  Directions,
};
