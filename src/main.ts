import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import "./style.css";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#bg") || undefined,
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const threeTone = new THREE.TextureLoader().load(
  "resources/gradientMaps/threeTone.jpg"
);
threeTone.minFilter = THREE.NearestFilter;
threeTone.magFilter = THREE.NearestFilter;

camera.position.setZ(30);
camera.position.setX(-3);

/** HELPERS */
const controls = new OrbitControls(camera, renderer.domElement);
const gridHelper = new THREE.GridHelper(200, 50);
const axesHelper = new THREE.AxesHelper(5);
scene.add(gridHelper, axesHelper);

/** LIGHTING */
const pointLight = new THREE.PointLight(0xffffff, 1);
const pointLightHelper = new THREE.PointLightHelper(pointLight);
pointLight.position.set(10, 10, 10);

// const ambientLight = new THREE.AmbientLight(0xffffff, 0);
scene.add(pointLight, pointLightHelper);

/** GEOMETRY */
const torusGeo = new THREE.TorusKnotGeometry(10, 3, 10, 100);
const torusMaterial = new THREE.MeshToonMaterial({
  color: 0xff0110,
  wireframe: false,
  side: THREE.FrontSide,
});

const torusMesh = new THREE.Mesh(torusGeo, torusMaterial);

scene.add(torusMesh);

let increase = true;
let tubularSegmentIterator = 10;

const setupKeyControls = () => {
  // var cube = scene.getObjectByName("cube");
  document.onkeydown = function (e) {
    console.log("e.code", e.code);
    switch (e.code) {
      case "ArrowLeft":
        torusMesh.position.z += 0.1;
        break;
      case "ArrowUp":
        torusMesh.position.x -= 0.1;
        break;
      case "ArrowRight":
        torusMesh.position.z -= 0.1;
        break;
      case "ArrowDown":
        torusMesh.position.x += 0.1;
        break;
    }
  };
};

setupKeyControls();

const animate = () => {
  requestAnimationFrame(animate);

  // torusMesh.rotation.x += 0.01;
  // torusMesh.rotation.y += 0.001;
  // torusMesh.rotation.z += 0.01;

  if (tubularSegmentIterator >= 128) {
    increase = false;
  } else if (tubularSegmentIterator <= 5) {
    increase = true;
  }
  torusMaterial.gradientMap = threeTone;

  if (increase) {
    tubularSegmentIterator += 0.1;
  } else {
    tubularSegmentIterator -= 0.1;
  }

  torusMesh.geometry = new THREE.TorusKnotGeometry(
    10,
    3,
    tubularSegmentIterator,
    100
  );

  controls.update();
  renderer.render(scene, camera);
};

animate();
