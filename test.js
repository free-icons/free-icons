"use strict";

const { readFileSync } = require("fs");
const Joi = require("joi");

const data = JSON.parse(readFileSync("dist/data.json").toString());
const types = ["brands", "thin", "light", "regular", "solid"];

const iconTypeSchema = Joi.object({
  d: Joi.string().required(),
  viewBox: Joi.string()
    .regex(
      /^\s*(-?\d*\.?\d+)\s+(-?\d*\.?\d+)\s+(-?\d*\.?\d+)\s+(-?\d*\.?\d+)\s*$/,
    )
    .required(),
  type: Joi.string()
    .allow(...types)
    .required(),
});

const iconsSchema = Joi.array()
  .items(
    Joi.object({
      name: Joi.string().required(),
      regularTypes: Joi.array().items(iconTypeSchema).required(),
      sharpTypes: Joi.array().items(iconTypeSchema).required(),
    }),
  )
  .required();

const { error } = iconsSchema.validate(data);

if (error) {
  console.error("Error: " + error.details[0].message);
  process.exit(1);
} else {
  const totalIcons = data
    .map((el) => el.regularTypes.length + el.sharpTypes.length)
    .reduce((acc, curr) => acc + curr, 0);
  console.log(`Everything looks fine 👍. total Icons: ${totalIcons}`);
}
