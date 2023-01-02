import * as THREE from "three";
const debug = true;
const disableForwardMovement = false;

type Directions = "Forwards" | "Backwards" | "Left" | "Right";

export type MovementDirections = {
  [key in Directions]: boolean;
};

type AccelerationValueType = {
  [key in Directions]: number;
};

type SpeedValueType = {
  [key in Directions]: number;
};

// Sway
const maxBoatSway = 0.5;
const swayMultiplier = 0.005;
let swayingDir: "left" | "right" = "left";
let swayIndex = 0;

// Movement
const maxSpeed = 5;
const accelerationMultiplier = 0.0005;
let worldMovementSpeed = 0.6;
const worldSpeedMultiplier = 0.0002;

let SpeedValues: SpeedValueType = {
  Right: 0,
  Left: 0,
  Forwards: 0,
  Backwards: 0,
};

let AccelValues: AccelerationValueType = {
  Right: 0,
  Left: 0,
  Forwards: 0,
  Backwards: 0,
};

const printDebugSpeeds = () => {
  const r = `r: ${SpeedValues.Right.toFixed(2)}`;
  const l = `l: ${SpeedValues.Left.toFixed(2)}`;
  const f = `f: ${SpeedValues.Forwards.toFixed(2)}`;
  const b = `b: ${SpeedValues.Backwards.toFixed(2)}`;

  // @ts-ignore
  document.getElementById("debugSection").innerHTML =
    r + "<br/>" + l + "<br/>" + f + "<br/>" + b + "<br/>";
};

const speedoMeter = (direction: Directions, pedalDown: boolean) => {
  let speedVal = SpeedValues[direction];
  let accelVal = AccelValues[direction];

  if (pedalDown) {
    // speedVal += accelVal;
    // accelVal += accelerationMultiplier;

    if (speedVal < maxSpeed) {
      speedVal += accelVal;
      accelVal += accelerationMultiplier;
    } else {
      speedVal = maxSpeed;
    }
  } else {
    if (speedVal > 0) {
      speedVal -= accelVal;
      accelVal -= accelerationMultiplier;
    } else {
      speedVal = 0;
      accelVal = 0;
    }
  }

  SpeedValues[direction] = speedVal;
  AccelValues[direction] = accelVal;
};

export const updateBoatSway = (boatModelPassed: any) => {
  let boatModel = boatModelPassed;

  if (swayingDir === "right" && swayIndex < maxBoatSway) {
    swayIndex += swayMultiplier;
  } else {
    swayingDir = "left";
  }

  if (swayingDir === "left" && swayIndex > -maxBoatSway) {
    swayIndex -= swayMultiplier;
  } else {
    swayingDir = "right";
  }

  if (boatModel) {
    // Check if the boat model is initialized correctly
    boatModel.rotation.z = swayIndex;
  }

  return boatModel;
};

const updateBoatRoutine = (
  boatGroupPassed: THREE.Group,
  currentMovementDirections: MovementDirections
) => {
  let boatGroup = boatGroupPassed;

  speedoMeter("Left", currentMovementDirections.Left);
  speedoMeter("Right", currentMovementDirections.Right);
  speedoMeter("Forwards", currentMovementDirections.Forwards);
  speedoMeter("Backwards", currentMovementDirections.Backwards);

  if (debug) {
    printDebugSpeeds();
  }

  if (!disableForwardMovement) {
    SpeedValues.Forwards = worldMovementSpeed;
  }

  boatGroup.position.z -= SpeedValues.Forwards; //SpeedValues.Forwards;
  boatGroup.position.z += SpeedValues.Backwards;
  boatGroup.position.x -= SpeedValues.Left;
  boatGroup.position.x += SpeedValues.Right;

  if (worldMovementSpeed < maxSpeed) {
    worldMovementSpeed += worldSpeedMultiplier;
  }

  return boatGroup;
};

export const updateCameraPos = (passedCamera: THREE.PerspectiveCamera) => {
  const camera = passedCamera;
  camera.position.z -= SpeedValues.Forwards;
  camera.position.z += SpeedValues.Backwards;
  camera.position.x -= SpeedValues.Left;
  camera.position.x += SpeedValues.Right;
  return camera;
};

export default updateBoatRoutine;
