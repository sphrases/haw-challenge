import * as THREE from "three";
// @ts-ignore
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { createFloorTile } from "./sceneobjects/createFloorTile";
import "./style.css";
import {
  addCollisionElements,
  loadCollisionEnemyMeshes,
} from "./sceneobjects/addCollisionElements";
import { Box3, BoxGeometry, Mesh, MeshLambertMaterial, Vector3 } from "three";
import { createHearts } from "./sceneobjects/createHearts";
import updateBoatRoutine, {
  updateBoatSway,
  updateCameraPos,
} from "./sideRoutines/updateBoatRoutine";
import "./sideRoutines/initializeFacetracking";
import { MovementDirections } from "./types/MovementTypes";
import { CustomGameEvents, GameControlEvent } from "./types/Events";
const boatElement = "resources/models/fishing_boat/scene.gltf";
const skyBoxTexture = "resources/textures/skyboxes/darkcartoon.jpeg";
const gltfLoader = new GLTFLoader();

/**
 * This is the very long "main routine" file
 * */

/** Game State */
let gameStarted = false;

/** Dev options */
/** This var allows debug information to be shown */
let debug = false;

/** Store the control inputs.*/
let currentMovementDirections: MovementDirections = {
  Left: false,
  Right: false,
  Forwards: false,
};

/** Spawning */
let spawnDelay = 1.2;
const clock = new THREE.Clock(true);
let lastSpawn = 0;

/** collision */
let enemyCollidersArray: THREE.Sphere[] = [];
let lives = 3;
let collisionDebouncer = false;

/** Scene init */
const scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

/** Renderer */
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#bgCanvas") || undefined,
  antialias: true,
});

/** Set renderer to match device*/
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
const cameraOffset = new Vector3(-0.05, 7, 13); // NOTE Constant offset between the camera and the target
camera.position.set(cameraOffset.x, cameraOffset.y, cameraOffset.z);
scene.add(camera);

/** HELPERS */
/** Used fot debugging */
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
if (debug) {
  const gridHelper = new THREE.GridHelper(200, 50);
  const axesHelper = new THREE.AxesHelper(5);
  scene.add(gridHelper, axesHelper);
}

/** LIGHTING */
/** Add main light source as well as debug helpers */
const directionalLight = new THREE.DirectionalLight("#ffeac0", 0.9);
directionalLight.castShadow = true;
directionalLight.position.set(5, 10, 3);
directionalLight.rotation.set(0.5, 0, -0.5);
scene.add(directionalLight);
if (debug) {
  const helper = new THREE.DirectionalLightHelper(directionalLight, 5);
  scene.add(helper);
}

/** ambient light to illuminate everything at least a little bit */
const ambientLight = new THREE.AmbientLight("#ffffff", 0.4);
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

/** Create Boat group
 * The boat group consists of the boat and an invisible collider box */
let boatGroup = new THREE.Group();
/** Add invisible bounding box to boat. This will allow the collision logic between the boat and the "enemy" elements */
const boatCube = new Mesh(
  new BoxGeometry(2.3, 5, 6),
  new MeshLambertMaterial({ wireframe: debug, visible: false })
);
const boatBoundingBox = new Box3(new Vector3(), new Vector3());
/** take the outermost points of the boat as the box size */
boatBoundingBox.setFromObject(boatCube);
boatGroup.add(boatCube);

/** Init boat 3d model */
let boatModel: any; // gltf
gltfLoader.load(
  boatElement,
  (gltf: any) => {
    boatModel = gltf.scene;
    boatModel.rotation.y = 3.15;
    boatModel.scale.set(0.01, 0.01, 0.01);
    boatGroup.add(boatModel);
  },
  undefined,
  (error: string) => {
    console.error(error);
  }
);
boatGroup.position.set(0, 0, -5);

scene.add(boatGroup);

/** Boat light */
const pointLight = new THREE.PointLight("#ffffff", 0.8);
const pointLightHelper = new THREE.PointLightHelper(pointLight);
pointLight.position.set(0, 5, 14);
boatGroup.add(pointLight);
if (debug) scene.add(pointLightHelper);

/** Heart model */
let heartModel1: any;
let heartModel2: any;
let heartModel3: any;

createHearts(0, (heartModelNew) => {
  heartModel1 = heartModelNew;
  console.log(typeof heartModel1);
  camera.add(heartModel1);
});

createHearts(1.2, (heartModelNew) => {
  heartModel2 = heartModelNew;
  camera.add(heartModel2);
});

createHearts(2.4, (heartModelNew) => {
  heartModel3 = heartModelNew;
  camera.add(heartModel3);
});



const spawnEnemies = () => {
  /** create enemies and their corresponding colliders */
  const elapsed = clock.getElapsedTime();
  if (elapsed - spawnDelay > lastSpawn) {
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
  /** Collision logic, we need to debounce the collision, as the collision boxes may intersect for more time then just one frame.
   * So trigger the event once the collision happens, but only retrigger it, if the collision is no longer happening */
  const foundCollision = enemyCollidersArray.find((enemy) => {
    return enemy.intersectsBox(boatBoundingBox);
  });

  if (foundCollision) {
    if (!collisionDebouncer) {
      collisionDebouncer = true;
      document.dispatchEvent(new CustomEvent(CustomGameEvents.EnemyCollision));
    }
  } else {
    collisionDebouncer = false;
  }
};

const handleCollisionEvent = () => {
  /** remove "lives" */
  switch (lives) {
    case 3:
      camera.remove(heartModel3);
      break;
    case 2:
      camera.remove(heartModel2);
      break;
    case 1:
      camera.remove(heartModel1);
      document.dispatchEvent(new CustomEvent(CustomGameEvents.GameOver));
      break;
  }
  lives -= 1;
};

const handleControlEvent = (event: GameControlEvent) => {
  /** store movement inputs in the corresponding object */
  const movementCopy = { ...currentMovementDirections };
  switch (event.detail.dir) {
    case "Left":
      movementCopy.Left = true;
      break;
    case "Right":
      movementCopy.Right = true;
      break;
    default:
      movementCopy.Left = false;
      movementCopy.Right = false;
      break;
  }
  currentMovementDirections = movementCopy;
};

const initEventListeners = () => {
  /** Since we dont have proper state management and have to utilize the "great" closure principles of vanilla JS,
   * I choose to use custom events to communicate the different states */

  document.addEventListener(CustomGameEvents.StartGame, () => {
    // @ts-ignore typescript thinks that the property could be null. This is impossible. No time for better typing
    document.getElementById("startDialogWrapper").style.display = "none";
    gameStarted = true;
  });

  document.addEventListener(CustomGameEvents.GameOver, () => {
    // @ts-ignore typescript thinks that the property could be null. This is impossible. No time for better typing#
    document.getElementById("gameOverWrapper").style.display = "flex";
    gameStarted = false;
  });

  document.addEventListener(CustomGameEvents.EnemyCollision, () => {
    handleCollisionEvent();
  });

  document.addEventListener(CustomGameEvents.ControlInput, (e: Event) => {
    /* Typing events is tricky. Should have implemented a generic, but didnt have time.
       To improve readability, i typecast to GameControlEvent.
    */
    handleControlEvent(e as GameControlEvent);
  });
};

const animate = () => {
  requestAnimationFrame(animate);
  boatModel = updateBoatSway(boatModel);

  if (gameStarted) {
    boatGroup = updateBoatRoutine(boatGroup, currentMovementDirections);
    camera = updateCameraPos(camera, boatGroup);
    spawnEnemies();
    checkCollision();
  }

  // @ts-ignore
  controls.target.copy({
    ...boatGroup.position,
    y: boatGroup.position.y + 7,
  });

  if (boatCube.geometry.boundingBox instanceof Box3) {
    boatBoundingBox
      .copy(boatCube.geometry.boundingBox)
      .applyMatrix4(boatCube.matrixWorld);
  }

  controls.update();
  renderer.render(scene, camera);
};

// Start routines
clock.start();

loadCollisionEnemyMeshes();
initEventListeners();
animate();
