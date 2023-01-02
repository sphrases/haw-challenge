import * as faceapi from "face-api.js";

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

let canvasRightBoundingCoordinate = 0;
let canvasLeftBoundingCoordinate = 0;

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/resources/mlModels"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/resources/mlModels"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/resources/mlModels"),
  faceapi.nets.faceExpressionNet.loadFromUri("/resources/mlModels"),
]).then(startVideo);

function startVideo() {
  console.log("navigator", navigator);
  navigator.mediaDevices
    .getUserMedia({ video: {} })
    .then((stream) => {
      if (video) {
        video.srcObject = stream;
        console.log("video", video);
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
      const sadDetected = resizeResults[0].expressions.sad;
      const boxColor = sadDetected > 0.85 ? "red" : "green";
      faceCenterX = box._x + box._width / 2;
      faceCenterY = box._y + box._height / 2;
      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.strokeStyle = boxColor;
      ctx.rect(box._x, box._y, box._width, box._height);
      ctx.stroke();

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

    let dir = "none";
    if (moveRight) dir = "right";
    if (moveLeft) dir = "left";

    let event = new CustomEvent("trackedMovement", {
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
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    drawFaceBoundingBoxCustom(resizedDetections);
    // faceapi.draw.drawDetections(faceTrackingCanvas, resizedDetections);
    // faceapi.draw.drawFaceLandmarks(faceTrackingCanvas, resizedDetections);
    // faceapi.draw.drawFaceExpressions(faceTrackingCanvas, resizedDetections);
  }, 100);
});
