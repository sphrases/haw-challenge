import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
const gltfLoader = new GLTFLoader();
const heartElement = "resources/models/heart/scene.gltf";

const createHearts = (offset: number, callback: (heartModelCB) => void) => {
  gltfLoader.load(
    heartElement,
    (gltf) => {
      let heartModel;
      heartModel = gltf.scene;
      heartModel.scale.set(0.2, 0.2, 0.2);
      heartModel.position.set(3, 1 * offset, -10);
      heartModel.rotation.set(0, 2, 0);
      callback(heartModel);
    },
    undefined,
    (error) => {
      console.error(error);
    }
  );
};

export { createHearts };
