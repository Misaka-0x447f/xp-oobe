import { useEffect } from 'react'

export const useBeforeMount = (fn: () => void) =>
  useEffect(() => {
    fn()
  }, [])
