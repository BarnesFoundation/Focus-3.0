import { ComponentLoader } from "adminjs";

const componentLoader = new ComponentLoader();

const Components = {
  Image: componentLoader.add(
    "MyInput",
    "/home/cjativa/Focus-3.0/dist/server/admin/image.js"
  ),
  // other custom components
};

export { componentLoader, Components };
