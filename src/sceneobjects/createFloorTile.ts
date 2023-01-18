import {
  CanvasTexture,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  RepeatWrapping,
  TextureLoader, Vector2,
} from "three";

const waterTexture = "resources/textures/Water_001_SD/Water_001_COLOR.jpg";
const waterTextureDISP = "resources/textures/Water_001_SD/Water_001_DISP.png";
const waterTextureNORM = "resources/textures/Water_001_SD/Water_001_NORM.png";

let texture = new TextureLoader().load(waterTexture);
texture.repeat.set(30, 3000);
texture.wrapT = RepeatWrapping;
texture.wrapS = RepeatWrapping;
/** There are issues with the repetition of the displacement map.
 * The displacement happens only in one direction rather then both.
 * TODO: fix */
let displacementMap = new TextureLoader().load(waterTextureDISP);
displacementMap.repeat.set(300, 300);
displacementMap.wrapT = RepeatWrapping;
displacementMap.wrapS = RepeatWrapping;

let normalMap = new TextureLoader().load(waterTextureNORM);
normalMap.repeat.set(300, 300);
normalMap.wrapT = RepeatWrapping;
normalMap.wrapS = RepeatWrapping;

const createFloorTile = () => {
  /** Create Floor geometry using the texture and displacement map */
  let planeGeometry = new PlaneGeometry(600, 60000, 3000, 1);
  let material = new MeshStandardMaterial({
    map: texture,
    displacementMap: displacementMap,
    displacementScale: 0.4,
    normalMap: normalMap,
    normalScale: new Vector2(.7, 3)
  });

  let mesh = new Mesh(planeGeometry, material);

  /** mesh needs to be laid flat and offset below the other models*/
  mesh.position.set(0, -0.2, 0);
  mesh.rotation.set(Math.PI / -2, 0, 0);

  return mesh;
};


/** Currently not used/broken
 * I initially planned to use a spritesheet as the floor tile to have animated water.
 * Due to time constraints, i wasn't able to implement it correctly
 * */
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

export { createFloorTile, SpriteSheetTexture };
