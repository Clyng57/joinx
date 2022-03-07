
module.exports.split = (template, regEx) => {
  let result = regEx.exec(template);
  const arr = [];
  let firstPos;
  while (result) {
    firstPos = result.index;
    if (firstPos !== 0) {
      arr.push(template.substring(0, firstPos));
      template = template.slice(firstPos);
    }
    arr.push(result[0]);
    template = template.slice(result[0].length);
    result = regEx.exec(template);
  }
  if (template) 
    arr.push(template);
  return arr;
}

module.exports.parseDataKeys = (dataObj, el)=> {
  let element = el;
  let dataKeys = Object.keys(dataObj);
  dataKeys.forEach(key => {
    let keyRegEx = new RegExp(`\\b${key}\\b`, 'g');
    if (element.match(keyRegEx)) {
      element = element.replaceAll(keyRegEx, `data.${key}`)
    }
  })
  return element;
}
