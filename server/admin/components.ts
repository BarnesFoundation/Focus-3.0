import { ComponentLoader } from "adminjs";

const componentLoader = new ComponentLoader();

const Components = {
  Image: componentLoader.add("Image", "./image"),
  // other custom components
};

export { componentLoader, Components };
