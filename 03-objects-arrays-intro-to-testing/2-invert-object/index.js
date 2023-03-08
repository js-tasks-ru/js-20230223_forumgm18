/**
 * invertObj - should swap object keys and values
 * @param {object} obj - the initial object
 * @returns {object | undefined} - returns new object or undefined if nothing did't pass
 */
export function invertObj(obj) {
  return (obj instanceof Object) 
         ? Object.fromEntries(Object.entries(obj).map(el => [el[1], el[0]]))
         : undefined;
}
