import express from "express";
import { join } from "path";
import cookieParser from "cookie-parser";

import Config, { EnvironmentStages } from "./config";
import { ApplicationSessions } from "./utils";
import { Admin, AdminRouter } from "./admin";
import ApiRouter from "./api/routes";
import { initializeSessionMiddlware } from "./api/middleware";
import { adminAuthenticationMiddleware } from "./admin/adminAuthenticationMiddleware";

const app = express();
const build = join(__dirname, "../build");
const index = join(build, "index.html");

console.log(`Initializing application. Current stage is: ${Config.nodeEnv}`);

// Configure some of our server-wide middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(build, { index: false, etag: false }));

// Configure Express to use our session store and API
app.use(ApplicationSessions);
app.use("/api", initializeSessionMiddlware, ApiRouter);

// Configure the AdminJS installation to run at the specified root path
// We're protecting all routes associated with it using HTTP basic authentication right now
// rather than the out-of-the-box authentication, until we can resolve dependency issues
app.use(Admin.options.rootPath, adminAuthenticationMiddleware, AdminRouter);

// Serve index on all requests to server.
app.get("*", (request: express.Request, response: express.Response) => {
  response.set({
    "Cache-Control": "private, no-cache, no-store, must-revalidate",
    Expires: "-1",
    Pragma: "no-cache",
  });

  response.sendFile(index);
});

// We only need to start the local server when running locally
if (Config.nodeEnv === EnvironmentStages.LOCAL)
  app.listen(Config.port, () => {
    console.log(`Server listening on port ${Config.port}`);
    console.log(
      `AdminJS started on http://localhost:${Config.port}${Admin.options.rootPath}`
    );
  });

export default app;
