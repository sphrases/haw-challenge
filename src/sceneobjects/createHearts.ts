// @ts-ignore
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
const gltfLoader = new GLTFLoader();
const heartElement = "resources/models/heart/scene.gltf";

const createHearts = (offset: number, callback: (heartModelCB: any) => void) => {
  gltfLoader.load(
    heartElement,
    (gltf: any) => {
      let heartModel;
      heartModel = gltf.scene;
      heartModel.scale.set(0.2, 0.2, 0.2);
      heartModel.position.set(3, 1 * offset, -10);
      heartModel.rotation.set(0, 2, 0);
      callback(heartModel);
    },
    undefined,
    (error: string) => {
      console.error(error);
    }
  );
};

export { createHearts };
