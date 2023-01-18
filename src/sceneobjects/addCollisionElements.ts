import * as THREE from "three";
import { Sphere } from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
/** Model from: https://www.cgtrader.com/free-3d-models/food/beverage/generic-beverage-can */
const duckyFBX = "resources/models/duck/FBX/RubberDuck_LOD0.fbx";
const beerCanFBX = "resources/models/beerCan/beerCan.fbx";

const fbxLoader = new FBXLoader();
const spawnSpread = 200;

let storedBeerObject: THREE.Group | null = null; // store the beer can once loaded
let storedDuckObj: THREE.Group | null = null; // store the beer can once loaded

export const loadCollisionEnemyMeshes = () => {
  /**
   * I don't like invoking functions like this from another file, when they manipulate local variables.
   * Again, closure in JS is a problem.
   * In react for example, I would have created context to store those meshes in. */
  loadBeerCan();
  loadDucky();
};

const loadBeerCan = () => {
  fbxLoader.load(
    beerCanFBX,
    (object) => {
      object.scale.set(0.1, 0.1, 0.1);
      storedBeerObject = object;
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    (error) => {
      console.log(error);
    }
  );
};

const loadDucky = () => {
  fbxLoader.load(
    duckyFBX,
    (object) => {
      object.scale.set(0.03, 0.03, 0.03);
      storedDuckObj = object;
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    (error) => {
      console.log(error);
    }
  );
};

const addCollisionElements = (boatGroup: THREE.Group) => {
  // Used to debug collision sphere set to same diameter as the collider
  // const geometry = new THREE.SphereGeometry(0.6, 24, 24);
  // const material = new THREE.MeshStandardMaterial({ color: 0xffffff });

  /** Create return group and array of colliders */
  let returnGroup = new THREE.Group();
  let collidersArray = [];

  /** Spawn 10 enemies iteratively */
  for (let i = 0; i < 10; i++) {
    const objectGroup = new THREE.Group();
    /** Random x coordinate and rotation.
     * Threejs uses polar coordinates for rotation, hence we have to reference PI to calculate the rot. */
    const randomXCoord = Math.floor(
      Math.random() * (spawnSpread + spawnSpread + 1) - spawnSpread
    );
    const randomRotation = Math.floor(
      Math.random() * (2 * Math.PI - 0 + 1) + 0
    );

    const coinFlip = Math.floor(Math.random() * 2 + 0);
    // Hacky way of spawning at least one enemy directly in the path of the boat.
    const x = i === 5 ? boatGroup.position.x : randomXCoord;
    const y = boatGroup.position.y;
    const z = boatGroup.position.z - 300; // spawn in front of the boat

    // the mesh can be used to debug the collider bounding sphere
    // const collisionElement = new THREE.Mesh(geometry, material);
    // objectGroup.add(collisionElement);

    if (coinFlip) {
      if (storedBeerObject) {
        // just in case, the beer object wasn't loaded correctly
        const newBeer = storedBeerObject.clone();
        newBeer.position.set(0, -1, 0);
        objectGroup.add(newBeer);
        objectGroup.rotation.set(0, randomRotation, Math.PI / 2);
        const colliderBoundingSphere = new Sphere(objectGroup.position, 0.8);
        collidersArray.push(colliderBoundingSphere);
      }
    } else {
      if (storedDuckObj) {
        // just in case, the duck object wasn't loaded correctly
        const newDuck = storedDuckObj.clone();
        newDuck.position.y = -0.3;
        objectGroup.add(newDuck);
        objectGroup.rotation.set(0, randomRotation, 0);
        const colliderBoundingSphere = new Sphere(objectGroup.position, 0.6);
        collidersArray.push(colliderBoundingSphere);
      }
    }

    objectGroup.position.set(x, y, z);

    returnGroup.add(objectGroup);
  }

  return { collisionElements: returnGroup, colliders: collidersArray };
};

export { addCollisionElements };
