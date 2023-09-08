import { bundle } from "@adminjs/bundler";
import path from "path";

// import { componentLoader } from "./admin/components";

(async () => {
  await bundle({
    customComponentsInitializationFilePath: path.join(
      "dist",
      "server",
      "admin",
      "components.js"
    ),
    destinationDir: path.join("dist", "build"),
  });
})();
