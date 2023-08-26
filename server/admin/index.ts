import AdminJS from "adminjs";
import AdminJSExpress from "@adminjs/express";
import { Database, Resource } from "@adminjs/prisma";
import { DMMFClass } from "@prisma/client/runtime";
import { PrismaClient } from "@prisma/client";

import { Components, componentLoader } from "./components";

const prisma = new PrismaClient();
const dmmf = (prisma as any)._dmmf as DMMFClass;
// @ts-ignore - This is necessary for @admin/prisma to work properly
prisma._baseDmmf = dmmf;

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

  resources: [
    {
      resource: { model: dmmf.modelMap.bookmarks, client: prisma },
      options: {},
    },
    {
      resource: { model: dmmf.modelMap.albums, client: prisma },
      options: {},
    },
    {
      resource: { model: dmmf.modelMap.photos, client: prisma },
      options: {
        properties: {
          searched_image_s3_url: {
            type: "string",
            components: {
              list: Components.Image,
            },
          },
        },
      },
    },
    {
      resource: { model: dmmf.modelMap.stories, client: prisma },
      options: {},
    },
    {
      resource: { model: dmmf.modelMap.subscriptions, client: prisma },
      options: {},
    },
    {
      resource: { model: dmmf.modelMap.translations, client: prisma },
      options: {},
    },
  ],
});
const AdminRouter = AdminJSExpress.buildRouter(Admin);

Admin.watch();

export { Admin, AdminRouter };
