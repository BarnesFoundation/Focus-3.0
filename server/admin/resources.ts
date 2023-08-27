import { DMMFClass } from "@prisma/client/runtime";
import { PrismaClient } from "@prisma/client";

import { Components } from "./components";

const prisma = new PrismaClient();
const dmmf = (prisma as any)._dmmf as DMMFClass;

// @ts-ignore - This is necessary for @admin/prisma to work properly
prisma._baseDmmf = dmmf;

export const resourceList = [
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
];
