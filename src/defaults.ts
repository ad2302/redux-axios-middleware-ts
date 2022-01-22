import { getActionTypes } from './getActionTypes';
import type { AnyAction } from 'redux'
import { OnCancel, OnError, OnSuccess, Options, TAxiosSourceAction } from './types';
export const returnRejectedPromiseOnError = false;

export const defaultClientName = 'default';

export const isAxiosRequest = (action: AnyAction): boolean => action.payload && action.payload.request;

export const isCancel = (value: any) => !!(value && value.__CANCEL__);

export const getRequestConfig = (action: TAxiosSourceAction) => action.payload.request;

export const getClientName = (action: AnyAction): string => action.payload.client;

export const getRequestOptions = (action: AnyAction): any => action.payload.options;

export const onSuccess = ({ action, next, response }: OnSuccess, options: Options) => {
  const nextAction = {
    type: getActionTypes(action, options)[1],
    payload: response,
    meta: {
      previousAction: action
    }
  };
  next(nextAction);
  return nextAction;
};

export const onCancel = ({ action, next, error }: OnCancel, options: Options) => {
  const nextAction = {
    type: getActionTypes(action, options)[3],
    error: {
      data: error.message,
      status: 0
    },
    cancelled: true,
    meta: {
      previousAction: action
    }
  };

  next(nextAction);
  return nextAction;
};

export const onError = ({ action, next, error }: OnError, options: Options) => {
  let errorObject;

  if (!error.response) {
    errorObject = {
      data: error.message,
      status: 0
    };
    if (process.env.NODE_ENV !== 'production') {
      console.log('HTTP Failure in Axios', error);
    }
  } else {
    errorObject = error;
  }

  const nextAction = {
    type: getActionTypes(action, options)[2],
    error: errorObject,
    meta: {
      previousAction: action
    }
  };

  next(nextAction);
  return nextAction;
};

export const onComplete = () => { };
