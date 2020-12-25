import md5 from '../md5'
export const inNode = () => typeof window === 'undefined'
export const getRandom = num => ~~(Math.random() * num)

export const encrypt = serverTime => {
  let localTime = Date.now()
  let sign = `{ximalaya-001}(${getRandom(
    100
  )})${serverTime}(${getRandom(100)})${localTime}`
  return sign.replace(/{([\w-]+)}/, (match, $1) => md5($1))
}