/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (size === undefined)  return string;
  if (typeof size === 'number' && size === 0)  return '';
  if (string.length <= size) return string;

  let 
    mask = string[0],
    start = 0;

  const res = [];
    for( let i = 1; i < string.length; i++) {
      if (string[i] != mask) {
        res.push(string.slice(start, i));
        mask = string[i];
        start = i;
      }
    }
  res.push(string.slice(start));

  return res.reduce((s, el) => {
    let mask = el[0].repeat(size);
    return s + ( el.includes(mask) ? mask : el)
  },'');
  

}
