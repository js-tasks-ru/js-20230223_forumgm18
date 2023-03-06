/**
 * uniq - returns array of uniq values:
 * @param {*[]} arr - the array of primitive values
 * @returns {*[]} - the new array with uniq values
 */
export function uniq(arr) {
  return (arr instanceof Array) 
          ? arr.reduce((res, el) => {
              if (!res.includes(el)) res.push(el);
              return res;
            },[]) 
          : [];
}
