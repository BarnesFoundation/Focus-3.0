import React from "react";
import { BasePropertyProps } from "adminjs";
import { Label, Box } from "@adminjs/design-system";

const Image = ({ property, record }: BasePropertyProps) => {
  return (
    <Box flex flexDirection={"column"} marginBottom={40}>
      <Label>{property.label}</Label>
      <img src={record.params[property.path]} style={{ alignSelf: "start" }} />
    </Box>
  );
};

export default Image;
