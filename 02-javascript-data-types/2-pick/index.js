/**
 * pick - Creates an object composed of the picked object properties:
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to pick
 * @returns {object} - returns the new object
 */
export const pick = (obj, ...fields) => {
  const objKeys = Object.keys(obj);
  const res = {}

  fields.forEach(el => {
    if (objKeys.includes(el)) res[el] = obj[el]; 
  });
  return res
};
