import * as faceapi from "face-api.js";
import { CustomGameEvents } from "../types/Events";
import { Directions } from "../types/MovementTypes";

/** init user agent check */
const onMobile =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

const video: HTMLVideoElement = document.getElementById(
  "faceTrackingVideo"
) as HTMLVideoElement;

let faceTrackingCanvas: HTMLCanvasElement = document.getElementById(
  "faceTrackingCanvas"
) as HTMLCanvasElement;

/** Init bounding coordinates. These store the pixel threshold,
 * which decides if the tracked face is in a "left" or "right" control area */
let canvasRightBoundingCoordinate = 0;
let canvasLeftBoundingCoordinate = 0;

/** load ML Models. Theoretically only the tinyDaceDetector would be necessary,
 * but I want to try to use the nose for steering instead.
 * During testing i found the user would often tilt the head, rather then move it side to side.
 * This means that the nose should be the leading point.
 * The promise.all waits for everything to be loaded and executes the "then" case after that.
 * TODO: remove unused models
 * */
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/resources/mlModels"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/resources/mlModels"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/resources/mlModels"),
  faceapi.nets.faceExpressionNet.loadFromUri("/resources/mlModels"),
]).then(startVideo);

function startVideo() {
  /** Init video function.
   * Since the page loads asynchronously, the video stream cant just be set up from the get go.
   * We have to wait for the user to allow the camera access for example. */
  navigator.mediaDevices
    .getUserMedia({ video: {} })
    .then((stream) => {
      // stream gotten successfully
      if (video) {
        video.srcObject = stream;
        /** Check whether the device is mobile.
         * the approach doesn't work properly, as the mobile video is often 9:16 instead of 16:9.
         * TODO: A better approach would be to crop to square eiter way.
         */
        if (window.innerHeight > window.innerWidth || onMobile) {
          video.width = window.innerWidth;
        } else {
          video.height = window.innerHeight * 0.3;
        }
      }
    })
    .catch((err) => console.error(err));
}

const drawFaceBoundingBoxCustom = (resizeResults: any) => {
  const ctx = faceTrackingCanvas?.getContext("2d");

  /** currently, the face center is used as the control trigger */
  let faceCenterX: number | null = null;
  let faceCenterY: number | null = null;
  let moveLeft = false;
  let moveRight = false;

  if (ctx) {
    ctx.clearRect(0, 0, faceTrackingCanvas.width, faceTrackingCanvas.height);
    /** clear the canvas either way, but only redraw if the results exist
     important: the canvas is mirrored to correspond with the video also being mirrored */
    if (resizeResults[0]) {
      const box = resizeResults[0].alignedRect._box;
      // I was planning to implement the "sad" expression as another control input.
      const sadDetected = resizeResults[0].expressions.sad;
      const boxColor = sadDetected > 0.85 ? "red" : "green";
      // calc face center
      faceCenterX = box._x + box._width / 2;
      faceCenterY = box._y + box._height / 2;
      // draw box
      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.strokeStyle = boxColor;
      ctx.rect(box._x, box._y, box._width, box._height);
      ctx.stroke();

      // draw center dot
      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "blue";
      ctx.arc(faceCenterX || 0, faceCenterY || 0, 1, 0, 2 * Math.PI, false);
      ctx.stroke();
    } else {
      faceCenterX = null;
      faceCenterY = null;
    }

    moveRight =
      (faceCenterX && faceCenterX < canvasRightBoundingCoordinate) || false;
    moveLeft =
      (faceCenterX && faceCenterX > canvasLeftBoundingCoordinate) || false;

    // draw Right Box
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = moveRight ? "green" : "grey";
    ctx.rect(0, 0, faceTrackingCanvas.width * 0.45, faceTrackingCanvas.height);
    ctx.stroke();

    // draw Left Box
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = moveLeft ? "green" : "grey";
    ctx.rect(
      canvasLeftBoundingCoordinate,
      0,
      faceTrackingCanvas.width * 0.45,
      faceTrackingCanvas.height
    );
    ctx.stroke();

    let dir: Directions = "Forwards";
    if (moveRight) dir = "Right";
    if (moveLeft) dir = "Left";

    /** Due to the lack of good closure, I decided to dispatch custom events in the
     * lifecycle functions to allow communication between the facetracking and game loops.
     *
     * This approach makes the facetracking a completely separate system, and lets it act as a "generic" user input.
     * If the game should instead be controlled by a keyboard, or touch controls. We could just replace the facetracking function
     * with a different one which just dispatches the same event.
     * */
    let event = new CustomEvent(CustomGameEvents.ControlInput, {
      detail: { dir },
    });
    document.dispatchEvent(event);
  }
};

video.addEventListener("playing", () => {
  const videoWrapper: HTMLElement = document.getElementById(
    "faceTrackingWrapper"
  ) as HTMLElement;

  const displaySize = {
    width: videoWrapper.offsetWidth,
    height: videoWrapper.offsetHeight,
  };
  faceapi.matchDimensions(faceTrackingCanvas, displaySize);

  canvasRightBoundingCoordinate = faceTrackingCanvas.width * 0.45;
  canvasLeftBoundingCoordinate = faceTrackingCanvas.width * 0.55;

  setInterval(async () => {
    /** set the an interval of 100ms, and ask faceApi to run the detections.
     * faceApi gives preprogrammed bounding boxes for the different landmarks,
     * but i decided to write my own drawing function, as I need to mirror the image anyways
     */
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    // pass to custom draw func.
    drawFaceBoundingBoxCustom(resizedDetections);
    // faceapi.draw.drawDetections(faceTrackingCanvas, resizedDetections);
    // faceapi.draw.drawFaceLandmarks(faceTrackingCanvas, resizedDetections);
    // faceapi.draw.drawFaceExpressions(faceTrackingCanvas, resizedDetections);
  }, 100);
});
