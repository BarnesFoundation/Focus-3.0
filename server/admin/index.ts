import AdminJS from "adminjs";
import AdminJSExpress from "@adminjs/express";
import { Database, Resource } from "@adminjs/prisma";

import { componentLoader } from "./components";
import { resourceList } from "./resources";
import { isDevelopment, isProduction } from "../config";
import EnvironmentConfiguration from "../config";

// @ts-ignore - Current version of Prisma doesn't know how to stringify BigInt type
BigInt.prototype.toJSON = function () {
  const int = Number.parseInt(this.toString());
  return int ?? this.toString();
};

// TODO - uncomment once we're on React 18 as that's used by AdminJS
/* const DEFAULT_ADMIN = {
  email: "admin@example.com",
  password: "somePassword",
};

const authenticate = async (email: string, password: string) => {
  if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
    return Promise.resolve(DEFAULT_ADMIN);
  }
  return null;
}; */

// Configure AdminJS instance and register our database adapter
AdminJS.registerAdapter({ Database, Resource });
const Admin = new AdminJS({
  databases: [],
  rootPath: "/focus-backoffice",
  componentLoader,
  resources: resourceList,

  // When on Production or Development, we need the AdminJS frontend assets from host
  assetsCDN:
    isProduction || isDevelopment
      ? EnvironmentConfiguration.assetHost
      : undefined,
});

const AdminRouter = AdminJSExpress.buildRouter(Admin);

// TODO - uncomment once we're on React 18 as that's used by AdminJS
/* const AdminRouter = AdminJSExpress.buildAuthenticatedRouter(
  Admin,
  {
    authenticate,
    cookieName: "adminjs",
    cookiePassword: "sessionsecret",
  },
  null,
  {
    store: Store,
    resave: true,
    saveUninitialized: true,
    secret: "sessionsecret",
    cookie: {
      httpOnly: process.env.NODE_ENV === "production",
      secure: process.env.NODE_ENV === "production",
    },
    name: "adminjs",
  }
); */

Admin.watch();

export { Admin, AdminRouter };
