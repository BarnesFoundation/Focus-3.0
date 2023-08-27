import AdminJS from "adminjs";
import AdminJSExpress from "@adminjs/express";
import { Database, Resource } from "@adminjs/prisma";

import { componentLoader } from "./components";
import { resourceList } from "./resources";

// @ts-ignore - Current version of Prisma doesn't know how to stringify BigInt type
BigInt.prototype.toJSON = function () {
  const int = Number.parseInt(this.toString());
  return int ?? this.toString();
};

// Configure AdminJS instance and register our database adapter
AdminJS.registerAdapter({ Database, Resource });
const Admin = new AdminJS({
  databases: [],
  rootPath: "/admin",
  componentLoader,
  resources: resourceList,
});
const AdminRouter = AdminJSExpress.buildRouter(Admin);

Admin.watch();

export { Admin, AdminRouter };
