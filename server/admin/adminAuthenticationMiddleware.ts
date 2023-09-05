import basicAuthenticationLib from "basic-auth";
import express from "express";

import Config from "../config";

const { basicAuth } = Config;

/** For now, since we can't use AdminJS' authentication for the Admin panel out-of-the-box
 *  We'll have to resort to using basic HTTP Authentication until then
 */
export const adminAuthenticationMiddleware = (
  request: express.Request,
  response: express.Response,
  next: express.NextFunction
) => {

  // If basic authentication is disabled, just return immediately
  if (Config.basicAuth.disabled) {
    return next();
  }


  const requestCredentials = basicAuthenticationLib(request);

  // If the credentials from the request don't match our configured
  // basic authentication, we'll reject the request
  if (
    !requestCredentials ||
    !basicAuth.name ||
    requestCredentials.name !== basicAuth.name ||
    requestCredentials.pass !== basicAuth.password
  ) {
    response.set("WWW-Authenticate", 'Basic realm="Focus"');
    return response.status(401).send();
  }
  return next();
};
