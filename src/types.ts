import type { Action, Dispatch } from 'redux';
import type { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { AnyAction } from 'redux';
import type { PayloadAction } from '@reduxjs/toolkit'
export type Client = { client: AxiosInstance, options?: Options };
export type Interceptors = { request?: any[], response?: any[] };
export type OnSuccess = {
  action: Action
  next: Dispatch
  response: AxiosResponse
}

export type OnCancel = {
  action: AnyAction
  next: Dispatch
  error: AxiosError
}

export type OnError = {
  action: AnyAction
  next: Dispatch
  error: AxiosError
}
export type Options = Partial<{
  errorSuffix: string;
  successSuffix: string;
  cancelSuffix: string;
  onSuccess(r?: OnSuccess, options?: Options): any;
  onError(r?: OnError, options?: Options): any;
  onComplete(): any;
  returnRejectedPromiseOnError: boolean;
  isAxiosRequest(action: AnyAction): boolean;
  getRequestConfig: (action: TAxiosSourceAction) => AxiosRequestConfig<any> & {
    reduxSourceAction: TAxiosSourceAction;
  };
  getClientName: (action: AnyAction) => string
  defaultClientName: string;
  getRequestOptions: (action: AnyAction) => any
  interceptors: Interceptors;
}>;

export type TAxiosSourceAction = Action<string> & {
  payload: TAxiosSourcePayload;
}

export type TAxiosSourcePayload = {
  request: AxiosRequestConfig & {
    reduxSourceAction: TAxiosSourceAction;
  }
}

export type AxiosAction = PayloadAction<{
  request: AxiosRequestConfig
}>

export interface AxiosActionError {
  error: AxiosError,
  meta: {
    previousAction: AnyAction
  },
  type: string
}

export interface AxiosActionResponse<T> {
  payload: AxiosResponse<T>
  meta: {
    previousAction: AnyAction
  },
  type: string
}
