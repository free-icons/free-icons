const { readFileSync } = require("fs");

const data = JSON.parse(readFileSync("dist/data.json").toString());

if (!Array.isArray(data)) throw new Error("data.json must consist of an array");
for (let i = 0; i < data.length; i++) {
  const element = data[i];
  if (typeof element != "object")
    throw new Error(
      `expected an object found type "${typeof element}" at index ${i}`
    );
  if (Array.isArray(element))
    throw new Error(`expected an object found type "array" at index ${i}`);
  if (typeof element.d != "string")
    throw new Error(
      `key "d" must be a string found type "${typeof element.d}" at index ${i}`
    );
  if (typeof element.type != "string")
    throw new Error(
      `key "type" must be a string found type "${typeof element.type}" at index ${i}`
    );
  if (typeof element.viewBox != "string")
    throw new Error(
      `key "viewBox" must be a string found type "${typeof element.viewBox}" at index ${i}`
    );
  if (typeof element.name != "string")
    throw new Error(
      `key "name" must be a string found type "${typeof element.name}" at index ${i}`
    );
  if (element.viewBox.split(" ").length != 4)
    throw new Error(
      `key "viewBox" must be a valid viewBox found "${element.viewBox}"`
    );
}

console.log(`Everything looks fine 👍. total Icons: ${data.length}`);