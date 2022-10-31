import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { isFunction } from 'lodash'

export const useBeforeMount = (fn: () => void) =>
  useEffect(() => {
    fn()
  }, [])

/**
 * @author 447f.misaka@blacklake.cn
 * this hook allows read an updated state value
 * immediately by an extra ref.
 * write to this ref is **not allowed** and should
 * trigger an error.
 * @example
 * >>>
 * const [value, setValue, valueRef] = useMixedState(null)
 * const submit = () => {
 *   // here we need to upload the latest value immediately.
 *   updateValueByPostV1(valueRef.current)
 * }
 * const change = (offset: number) => {
 *   // and here, since no need of immediately update,
 *   // we use the value.
 *   setValue(value + offset)
 * }
 *
 * // in the render part use of reactively value is required.
 * return (
 *   <div>{value}</div>
 * )
 */
export const useMixedState = <T>(initialValue: T) => {
  const [state, setState] = useState(initialValue)
  const ref = useRef(initialValue)
  const set = useCallback((val: T) => {
    if (isFunction(val)) {
      ref.current = val(ref.current)
    } else {
      ref.current = val
    }
    setState(val)
  }, [])
  const refBehindProxy = useMemo(
    () =>
      new Proxy(ref, {
        set: () => {
          throw new Error(
            "Do not change value of this ref, it's readonly. Instead, use the set method."
          )
        }
      }),
    []
  )
  return [state, set, refBehindProxy] as [
    typeof state,
    Dispatch<SetStateAction<T>>,
    {
      readonly current: T
    },
  ]
}
