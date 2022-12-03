import * as THREE from "three";
import { Sphere } from "three";

const spawnSpread = 200;

const addCollisionElements = (boatGroup: THREE.Group) => {
  const geometry = new THREE.SphereGeometry(0.25, 24, 24);
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });

  let returnGroup = new THREE.Group();
  let collidersArray = [];

  for (let i = 0; i < 10; i++) {
    const collisionElement = new THREE.Mesh(geometry, material);
    const randomXX = Math.floor(
      Math.random() * (spawnSpread + spawnSpread + 1) - spawnSpread
    );

    const x = boatGroup.position.x + randomXX;
    const y = boatGroup.position.y;
    const z = boatGroup.position.z - 200;
    collisionElement.position.set(x, y, z);

    const colliderBoundingSphere = new Sphere(collisionElement.position, 0.25);
    collidersArray.push(colliderBoundingSphere);
    returnGroup.add(collisionElement);
  }

  return { collisionElements: returnGroup, colliders: collidersArray };
};

export { addCollisionElements };
