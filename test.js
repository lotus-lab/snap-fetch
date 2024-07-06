const str = "a book is good";

const capitalize = (value) => {
  const splitArray = value.split(" ");

  const capitalizedResult = [];
  for (const item of splitArray) {
    const result = item.charAt(0).toUpperCase() + item.toLowerCase().slice(1);
    capitalizedResult.push(result);
  }

  return capitalizedResult.join(" ");
};

const range = (options) => {
  let { start, end, skip } = options;
  const rangeResult = [];

  if (start === undefined) start = 0;
  if (end === undefined) end = 10;

  if (start === end) start = 0;

  for (let i = start; i <= end; i = i + Number(skip || 1)) {
    rangeResult.push(i);
  }
  console.log(rangeResult);
  return rangeResult;
};

// range({ start: 0, end: 100 });

// const resultTwo = str
//   .toLowerCase()
//   .replace(/([^a-z])([a-z])(?=[a-z]{0})|^([a-z])/g, function (_, g1, g2, g3) {
//     return typeof g1 === "undefined" ? g3.toUpperCase() : g1 + g2.toUpperCase();
//   });

// console.log(resultTwo);

const average = (arr, round) => {
  const checkIfAllNumber = arr.every(
    (value) => typeof value === "number" || Number(value) == value
  );
  if (!checkIfAllNumber)
    throw new Error("Provided Array Contain None Numerical Value");

  const result = arr.reduce((a, b) => a + b, 0) / arr.length;

  if (round) return Math.round(result);
  else return result;
};

// console.log(average([1, "6", 3]));

const formatCurrency = (price, currency = "USD", customMessage) => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  });
  if (price) {
    return formatter.format(price);
  }
  return customMessage || "Pending";
};

// console.log(formatCurrency(5, "EUR", "No"));

const sanitizeString = (options) => {
  let { string, trimNumber, makeUriFriendly, stringCase } = options;

  const htmlTrimRegex =
    /<\/?([a-z][a-z0-9]*)\b[^>]*>|<!--[\s\S]*?-->|<\?[\s\S]*?\?>/gi;
  const specialCharsRegex = /[^\w\s]|_/g;

  const numberRegex = /\d+/g;

  string = string
    .replaceAll("&amp;", "and")
    .replace(htmlTrimRegex, "")
    .replace(specialCharsRegex, "")
    .trim();

  if (trimNumber) string = string.replace(numberRegex, "");

  if (makeUriFriendly) string = string.replaceAll(" ", "-");

  if (stringCase === "uppercase") {
    string = string.toUpperCase();
  } else if (stringCase === "lowercase") {
    string = string.toLowerCase();
  } else if (stringCase === "capitalize") {
    string = capitalize(string);
  }

  let sanitizedString = string;

  return sanitizedString;
};

// console.log(
//   sanitizeString({
//     string: "<h1>(7). &8!#$ arkena 89 team Is Great Team</h1>",
//     trimNumber: true,
//     stringCase: "capitalize",
//   })
// );

// const generateColorShade = (hex, lightScale) => {
//   const hexToRGB = (hex) => {
//     const slicedHex = hex.slice(hex.indexOf("#") + 1);
//     if (slicedHex.length !== 6) {
//       throw new Error("Only six-digit hex colors are allowed.");
//     }
//     const aRgbHex = slicedHex.match(/.{1,2}/g);
//     const aRgb = [
//       parseInt(aRgbHex[0], 16),
//       parseInt(aRgbHex[1], 16),
//       parseInt(aRgbHex[2], 16),
//     ];
//     return { aRgb, r: aRgb[0], g: aRgb[1], b: aRgb[2] };
//   };
//   const { b, g, r } = hexToRGB(hex);
//   const max = Math.max(Math.max(r, Math.max(g, b)), 1);

//   const step = 255 / (max * 10);
//   const color = `rgb(${Math.round(r * step * lightScale)}, ${Math.round(
//     g * step * lightScale
//   )}, ${Math.round(b * step * lightScale)})`;
//   return color;
// };

function generateShades(hexColor) {
  // Convert the hex color to RGB
  var r = parseInt(hexColor.substring(1, 3), 16);
  var g = parseInt(hexColor.substring(3, 5), 16);
  var b = parseInt(hexColor.substring(5, 7), 16);

  // Calculate the step value for each shade
  var step = Math.floor(255 / 8);

  // Generate the shades
  var shades = [];
  for (var i = 0; i <= 8; i++) {
    var shadeR = Math.max(0, r - step * i);
    var shadeG = Math.max(0, g - step * i);
    var shadeB = Math.max(0, b - step * i);
    var shadeHex = rgbToHex(shadeR, shadeG, shadeB);
    shades.push(shadeHex);
  }

  return shades;
}

function rgbToHex(r, g, b) {
  var hexR = r.toString(16).padStart(2, "0");
  var hexG = g.toString(16).padStart(2, "0");
  var hexB = b.toString(16).padStart(2, "0");
  return "#" + hexR + hexG + hexB;
}
