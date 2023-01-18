// @ts-ignore
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
const gltfLoader = new GLTFLoader();
const heartElement = "resources/models/heart/scene.gltf";

/** This function will load and create the three heart models. Since the closure problems of JS exist, I decided to try passing a callback function  */
const createHearts = (offset: number, callback: (heartModelCB: any) => void) => {
  gltfLoader.load(
    heartElement,
    (gltf: any) => {
      let heartModel;
      heartModel = gltf.scene;
      heartModel.scale.set(0.2, 0.2, 0.2);
      heartModel.position.set(2, -2 + offset, -10);
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
