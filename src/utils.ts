
const isString = (string: any): boolean => {
  return typeof string === 'string' || string instanceof String
}

isString('')
