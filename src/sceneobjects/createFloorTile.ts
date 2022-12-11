import {
  CanvasTexture,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  RepeatWrapping,
  ShadowMaterial,
  TextureLoader,
} from "three";

const waterTexture = "resources/textures/Water_001_SD/Water_001_COLOR.jpg";

const createFloorTile = () => {
  let texture = new TextureLoader().load(waterTexture);
  texture.repeat.set(30, 3000);
  texture.wrapT = RepeatWrapping;
  texture.wrapS = RepeatWrapping;

  let planeGeometry = new PlaneGeometry(600, 60000);
  let material = new MeshStandardMaterial({
    map: texture,
  });

  //material.displacementMap = waterTextureDISP;
  //material.displacementScale = 10;
  //material.displacementBias = 1;

  let mesh = new Mesh(planeGeometry, material);

  mesh.position.set(0, -0.1, 0);
  mesh.rotation.set(Math.PI / -2, 0, 0);

  return mesh;
};

const createFloorShadow = () => {
  const geometry = new PlaneGeometry(2000, 2000);
  geometry.rotateX(-Math.PI / 2);

  const material = new ShadowMaterial();
  material.opacity = 0.2;

  const plane = new Mesh(geometry, material);
  plane.position.y = 0;
  plane.receiveShadow = true;
  return plane;
};

/** Currently not used/broken */
const SpriteSheetTexture = (
  imageURL: string,
  framesX: number,
  framesY: number,
  frameDelay: number,
  _endFrame: number
) => {
  let frameWidth: number = 0;
  let frameHeight: number = 0;
  let x = 0;
  let y = 0;
  let count = 0;
  const endFrame = _endFrame || framesX * framesY;
  const canvas = document.createElement("canvas");
  let ctx = canvas.getContext("2d");
  const canvasTexture = new CanvasTexture(canvas);
  const img = new Image();

  img.onload = () => {
    frameWidth = img.width / framesX;
    frameHeight = img.height / framesY;
    canvas.width = frameWidth;
    canvas.height = frameHeight;
    setInterval(() => {
      count++;

      if (count >= endFrame) {
        count = 0;
      }

      x = (count % framesX) * frameWidth;
      y = ((count / framesX) | 0) * frameHeight;

      ctx?.clearRect(0, 0, frameWidth, frameHeight);
      ctx?.drawImage(
        img,
        x,
        y,
        frameWidth,
        frameHeight,
        0,
        0,
        frameWidth,
        frameHeight
      );

      canvasTexture.needsUpdate = true;
    }, frameDelay);
  };
  img.src = imageURL;

  return canvasTexture;
};

export { createFloorTile, SpriteSheetTexture, createFloorShadow };
