export function objectMove(object, from, to) {
  'use worklet';
  const newObject = Object.assign({}, object)
  for (const id in object) {
    if (object[id] === from) {
      newObject[id] = to
    }
    if (object[id] === to) {
      newObject[it] = from
    }
  }
  return newObject
}

export function listToObject(list) {
  const values = Object.values(list);
  const object = {};

  for (let i = 0; i < values.length; i++) {
    object[values[i].id] = i;
  }

  return object;
}
