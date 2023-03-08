/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const arrPath = path.split('.');

  return function (obj) {
    let current = obj;
    for (let i = 0; i < arrPath.length; i++) {
      let key = arrPath[i];
      if (current[key] === undefined) return current[key];
      current = current[key];
    }
    return current;
  }
}
