export const selectCase = <T>(...cases: Array<[boolean, () => T]>) => {
  for (const item of cases) {
    if (item[0]) return item[1]?.()
  }
  throw new Error(
    'Assertion Error: selectCase ends with no result. Define a default branch like [true, () => null].'
  )
}

export const selectCaseByValue = <T, U>(value: U, ...cases: Array<[U, () => T | unknown]>) => {
  for (const item of cases) {
    if (item[0] === value) return item[1]?.()
  }
  throw new Error(
    'Assertion Error: selectCase ends with no result. Define a default branch like [true, () => null].'
  )
}

export const sleep = async (ms: number) => await new Promise(resolve => setTimeout(resolve, ms))
