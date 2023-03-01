/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  const ar = [...arr];
  const compare = (a, b) => a.localeCompare(b, ['ru', 'en'],{ caseFirst: 'upper', numeric: true });

  switch(param) {
    case 'asc':
      return ar.sort(compare);
    case 'desc':
      return ar.sort((a, b) => -compare(a, b));
    default : return ar;  
  }
}
