import Config from "../../config";

export const generateImgixUrl = (id: string, secret: string) => {
  return `https://${Config.imgix.repo}.imgix.net/${id}_${secret}_b.jpg`;
};
