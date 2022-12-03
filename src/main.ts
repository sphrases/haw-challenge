import * as THREE from "three";
import { TWEEN } from "three/examples/jsm/libs/tween.module.min";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { createFloorTile } from "./sceneobjects/createFloorTile";
import "./style.css";
import { addCollisionElements } from "./sceneobjects/addCollisionElements";
import { Box3, BoxGeometry, Mesh, MeshLambertMaterial, Vector3 } from "three";
import { createHearts } from "./sceneobjects/createHearts";

const boatElement = "resources/models/fishing_boat/scene.gltf";
const skyBoxTexture = "resources/textures/skyboxes/darkcartoon.jpeg";
const gltfLoader = new GLTFLoader();

const debug = false;

/** Movement */
const startSpeed = 0.5;
const maxSpeed = 20;
let movementSpeed = 10;
let acceleration = 0.05;
let moving = false;

/** Spawning */
let spawnDelay = 1.2;
const clock = new THREE.Clock(true);
let lastSpawn = 0;

/** collision */
let enemyCollidersArray: THREE.Sphere[] = [];
let lives = 3;
let collisionDebouncer = false;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

/** Renderer */
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#bg") || undefined,
  antialias: true,
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
const cameraOffset = new Vector3(-0.05, 7, 13); // NOTE Constant offset between the camera and the target
camera.position.set(cameraOffset.x, cameraOffset.y, cameraOffset.z);
scene.add(camera);

/** HELPERS */
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
const gridHelper = new THREE.GridHelper(200, 50);
const axesHelper = new THREE.AxesHelper(5);
if (debug) scene.add(gridHelper, axesHelper);

/** LIGHTING */
const directionalLight = new THREE.DirectionalLight("#ffeac0", 0.9);
const helper = new THREE.DirectionalLightHelper(directionalLight, 5);
directionalLight.castShadow = true;
directionalLight.position.set(5, 10, 3);
directionalLight.rotation.set(0.5, 0, -0.5);
scene.add(directionalLight);
if (debug) scene.add(helper);

const ambientLight = new THREE.AmbientLight("#ffffff", 0.2);
scene.add(ambientLight);

/** SETUP floor */
scene.add(createFloorTile());

/** Setup Skybox*/

const loader = new THREE.TextureLoader();
const texture = loader.load(skyBoxTexture, () => {
  const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
  rt.fromEquirectangularTexture(renderer, texture);
  scene.background = rt.texture;
});

/** Create Boat model */
const boatCube = new Mesh(
  new BoxGeometry(2.3, 5, 6),
  new MeshLambertMaterial({ wireframe: debug, visible: false })
);

const boatBoundingBox = new Box3(new Vector3(), new Vector3());
boatBoundingBox.setFromObject(boatCube);
let boatModel; // gltf
let boatGroup = new THREE.Group();
boatGroup.add(boatCube);
gltfLoader.load(
  boatElement,
  (gltf) => {
    boatModel = gltf.scene;
    boatModel.rotation.y = 3.15;
    boatModel.scale.set(0.01, 0.01, 0.01);

    console.log("boardBoundingBox", boatBoundingBox);

    boatGroup.add(boatModel);
  },
  undefined,
  (error) => {
    console.error(error);
  }
);
scene.add(boatGroup);

/** Boat light */
const pointLight = new THREE.PointLight("#ffffff", 0.8);
const pointLightHelper = new THREE.PointLightHelper(pointLight);
pointLight.position.set(0, 5, 14);
boatGroup.add(pointLight);
scene.add(pointLightHelper);

/** Heart model */

let heartModel1;
let heartModel2;
let heartModel3;

createHearts(0, (heartModelNew) => {
  heartModel1 = heartModelNew;
  camera.add(heartModel1);
});

createHearts(1.5, (heartModelNew) => {
  heartModel2 = heartModelNew;
  camera.add(heartModel2);
});

createHearts(3, (heartModelNew) => {
  heartModel3 = heartModelNew;
  camera.add(heartModel3);
});

const movementHandler = (evt: KeyboardEvent) => {
  switch (evt.key) {
    case "s":
      moveBack();
      break;
    case "w":
      moving = true;
      moveForward();
      break;
    case "q":
      rotLeft();
      break;
    case "e":
      rotRight();
      break;
    case "a":
      moveLeft();
      break;
    case "d":
      moveRight();
      break;
    case "f":
      break;
  }
};

const updateCamera = () => {
  const objectPosition = new Vector3();
  boatGroup.getWorldPosition(objectPosition);

  console.log("objectPosition", objectPosition);
  camera.position.copy(objectPosition).add(cameraOffset);
};

const moveWorldForward = () => {
  boatGroup.position.z -= movementSpeed;
  camera.position.z -= movementSpeed;
  controls.target.copy(boatGroup.position);
};

const moveForward = () => {
  const newPosZ = boatGroup.position.z - movementSpeed;
  new TWEEN.Tween(boatGroup.position)
    .to({ z: newPosZ }, 1000)
    .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate((object) => {
      boatGroup.position.z = object.z;
      camera.position.z = object.z + cameraOffset.z;
      controls.target.copy(object);
    })
    .start();
};

const moveBack = () => {
  boatGroup.position.z += movementSpeed;
  camera.position.z += movementSpeed;
  controls.target.copy(boatGroup.position);
};

const moveLeft = () => {
  const newPosX = boatGroup.position.x - movementSpeed * 10;
  new TWEEN.Tween(boatGroup.position)
    .to({ x: newPosX }, 1000)
    .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate((object) => {
      boatGroup.position.x = object.x;
      camera.position.x = object.x + cameraOffset.x;
      controls.target.copy(object);
    })
    .start();
};

const moveRight = () => {
  const newPosX = boatGroup.position.x + movementSpeed * 10;
  new TWEEN.Tween(boatGroup.position)
    .to({ x: newPosX }, 1000)
    .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate((object) => {
      boatGroup.position.x = object.x;
      camera.position.x = object.x + cameraOffset.x;
      controls.target.copy(object);
    })
    .start();
};
const rotLeft = () => {
  boatGroup.rotation.y += Math.PI / 60;
};

const rotRight = () => {
  boatGroup.rotation.y -= Math.PI / 60;
};

const accelerateMovementSpeed = () => {
  if (moving) {
    if (movementSpeed <= maxSpeed) {
      movementSpeed += acceleration;
    }
  } else {
    movementSpeed = startSpeed;
  }
};

const spawnEnemies = () => {
  const elapsed = clock.getElapsedTime();
  if (elapsed - spawnDelay > lastSpawn) {
    console.log("spawn");

    const collisionElements = addCollisionElements(boatGroup);
    scene.add(collisionElements.collisionElements);
    enemyCollidersArray = [
      ...enemyCollidersArray,
      ...collisionElements.colliders,
    ];
    lastSpawn = elapsed;

    if (spawnDelay > 0.1) {
      spawnDelay -= 0.01;
    }
  }
};

const checkCollision = () => {
  const foundCollision = enemyCollidersArray.find((enemy) => {
    return enemy.intersectsBox(boatBoundingBox);
  });

  if (foundCollision) {
    if (!collisionDebouncer) {
      console.log("ALARM");
      collisionDebouncer = true;
      switch (lives) {
        case 3:
          camera.remove(heartModel3);
          break;
        case 2:
          camera.remove(heartModel2);
          break;
        case 1:
          camera.remove(heartModel1);
          break;
      }

      lives -= 1;
    }
  } else {
    collisionDebouncer = false;
  }
};

const init = () => {
  clock.start();
  window.addEventListener("keydown", movementHandler, false);
  window.addEventListener(
    "keyup",
    () => {
      moving = false;
    },
    false
  );
};
console.log("boatModel", boatModel);
const animate = () => {
  requestAnimationFrame(animate);

  boatBoundingBox
    .copy(boatCube.geometry.boundingBox)
    .applyMatrix4(boatCube.matrixWorld);

  spawnEnemies();
  checkCollision();
  moveWorldForward();
  TWEEN.update();

  accelerateMovementSpeed();
  controls.update();
  renderer.render(scene, camera);
};

init();
animate();
