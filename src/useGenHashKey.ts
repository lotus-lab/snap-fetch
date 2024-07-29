import { useCallback, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { djb2Hash } from './utils/utils';
import { selectAllHashKeys } from './selectors/selectors';
import { actions } from './toolkit';

export const useGenHashKey = (value: string) => {
  const dispatch = useDispatch();
  const hashedValue = useMemo(() => djb2Hash(value), [value]);
  const hashKey = useSelector(selectAllHashKeys)?.[hashedValue];

  const hashKeyGen = useCallback(() => {
    if (!hashKey) {
      dispatch(actions.setHashKey(hashedValue));
    }
  }, [hashedValue, hashKey, dispatch]);

  useEffect(() => {
    hashKeyGen();
  }, [hashKeyGen]);

  return { hashKey };
};
