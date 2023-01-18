import * as THREE from "three";
import {
  AccelerationValueType,
  Directions,
  MovementDirections,
  SpeedValueType,
} from "../types/MovementTypes";
import { twoDecRound } from "../sideRoutines/helperFunc";

const debug = false;
const disableForwardMovement = false;

// Sway
const maxBoatSway = .7;
let swayIndex = 0;

/** Movement */
/** These parameters can/must be tweaked */
const maxSpeed = 1;
const maxWorldSpeed = 5;
const accelerationMultiplier = 0.001;
let worldMovementSpeed = 0.6;
const worldSpeedMultiplier = 0.0002;
const leftRightLimit = 200;

/** Store current speeds */
let SpeedValues: SpeedValueType = {
  Right: 0,
  Left: 0,
  Forwards: 0,
  // Backwards: 0,
};

/** Store acceleration values */
let AccelValues: AccelerationValueType = {
  Right: 0,
  Left: 0,
  Forwards: 0,
  // Backwards: 0,
};

const printDebugSpeeds = () => {
  /** Used to display the speeds in the viewport. Mainly for testing */
  const r = `r: ${SpeedValues.Right.toFixed(2)}`;
  const l = `l: ${SpeedValues.Left.toFixed(2)}`;
  const f = `f: ${SpeedValues.Forwards.toFixed(2)}`;
  // const b = `b: ${SpeedValues.Backwards.toFixed(2)}`;

  // @ts-ignore
  document.getElementById("debugSection").innerHTML =
    r + "<br/>" + l + "<br/>" + f;
};

const speedoMeter = (direction: Directions, pedalDown: boolean) => {
  /** This function calculates the acceleration.
   * When the pedal is down (boolean), the accel. value increases. Otherwise it should slow down
   * A function like this requires a lot of fine tuning, that's why i have put a lot of
   * variables in the top of the document*/
  let speedVal = SpeedValues[direction];
  let accelVal = AccelValues[direction];

  if (pedalDown) {
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
  /** To have a more natural sway, the current speed is used to
   * create a lean value. */
  if (SpeedValues.Right > 0) {
    // the .2 is to catch a recurring rounding error
    if (swayIndex >= -maxBoatSway - 0.2) {
      // rounding, since JS often creates errors with float/long dec. variables
      swayIndex = -(maxBoatSway * twoDecRound(SpeedValues.Right));
    }
  } else if (SpeedValues.Left > 0) {
    if (swayIndex <= maxBoatSway + 0.2) {
      swayIndex = maxBoatSway * twoDecRound(SpeedValues.Left);
    }
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
  // speedoMeter("Forwards", currentMovementDirections.Forwards);
  // speedoMeter("Backwards", currentMovementDirections.Backwards);

  if (debug) {
    printDebugSpeeds();
  }

  if (!disableForwardMovement) {
    // for testing
    SpeedValues.Forwards = worldMovementSpeed;
  }

  // automatically move boat forwards
  boatGroup.position.z -= SpeedValues.Forwards;


  if (boatGroup.position.x < leftRightLimit) {
    boatGroup.position.x += SpeedValues.Right;
  }

  if (boatGroup.position.x > -leftRightLimit) {
    boatGroup.position.x -= SpeedValues.Left;
  }

  // slowly increase world speed to make the game more difficult.
  if (worldMovementSpeed < maxWorldSpeed) {
    worldMovementSpeed += worldSpeedMultiplier;
  }

  return boatGroup;
};

export const updateCameraPos = (
  passedCamera: THREE.PerspectiveCamera,
  boatGroupPassed: THREE.Group
) => {
  const camera = passedCamera;
  camera.position.z -= SpeedValues.Forwards;

  if (boatGroupPassed.position.x < leftRightLimit) {
    camera.position.x += SpeedValues.Right;
  }

  if (boatGroupPassed.position.x > -leftRightLimit) {
    camera.position.x -= SpeedValues.Left;
  }

  return camera;
};

export default updateBoatRoutine;
