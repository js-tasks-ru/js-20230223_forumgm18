/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  let ar = [...arr];
  switch(param) {
    case 'asc':
      return ar.sort((a, b) => a.localeCompare(b, undefined,{ caseFirst: 'upper' }));
    case 'desc':
      return ar.sort((a, b) => a.localeCompare(b, undefined,{ caseFirst: 'upper' })).reverse();
    default : return ar;  
  }
}
