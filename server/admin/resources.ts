import { DMMFClass } from "@prisma/client/runtime";
import { PrismaClient } from "@prisma/client";

import { Components } from "./components";

const prisma = new PrismaClient();
const dmmf = (prisma as any)._dmmf as DMMFClass;

// @ts-ignore - This is necessary for @admin/prisma to work properly
prisma._baseDmmf = dmmf;

// Prevent editing single resources via UI and API
const disabledEditAction = {
  edit: {
    isAccessible: false,
    isVisible: false,
  },
};

// Prevent deleting single resources via UI and API
const disabledDeleteAction = {
  delete: {
    isAccessible: false,
    isVisible: false,
  },
};

// Prevent bulk deleting resources via UI and API
const disabledBulkDeleteAction = {
  bulkDelete: {
    isAccessible: false,
    isVisible: false,
  },
};

export const resourceList = [
  {
    resource: { model: dmmf.modelMap.bookmarks, client: prisma },
    options: {
      actions: {
        ...disabledEditAction,
        ...disabledDeleteAction,
        ...disabledBulkDeleteAction,
      },
    },
  },
  {
    resource: { model: dmmf.modelMap.albums, client: prisma },
    options: {
      actions: {
        ...disabledEditAction,
        ...disabledDeleteAction,
        ...disabledBulkDeleteAction,
      },
    },
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
      actions: {
        ...disabledEditAction,
        ...disabledDeleteAction,
        ...disabledBulkDeleteAction,
      },
    },
  },
  {
    resource: { model: dmmf.modelMap.stories, client: prisma },
    options: {
      actions: {
        ...disabledEditAction,
        ...disabledDeleteAction,
        ...disabledBulkDeleteAction,
      },
    },
  },
  {
    resource: { model: dmmf.modelMap.subscriptions, client: prisma },
    options: {
      actions: {
        ...disabledEditAction,
        ...disabledDeleteAction,
        ...disabledBulkDeleteAction,
      },
    },
  },
  {
    resource: { model: dmmf.modelMap.translations, client: prisma },
    options: {
      actions: {
        ...disabledEditAction,
        ...disabledDeleteAction,
        ...disabledBulkDeleteAction,
      },
    },
  },
];
