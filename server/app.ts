import express from "express";
import { join } from "path";
import cookieParser from "cookie-parser";

import Config, { EnvironmentStages } from "./config";
import ApiRouter from "./api/routes";

const app = express();
const build = join(__dirname, "../build");
const index = join(build, "index.html");

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(build, { index: false, etag: false }));

app.use("/api", ApiRouter);

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
  app.listen(Config.port, () =>
    console.log(`Server listening on port ${Config.port}`)
  );

export default app;
