import * as defaultOptions from './defaults';
import { getActionTypes } from './getActionTypes';
import type { AxiosInstance, AxiosResponse, AxiosInterceptorManager, AxiosRequestConfig } from 'axios';
import type { ThunkDispatch, ThunkMiddleware } from 'redux-thunk';
import type { Client, Interceptors, Options, TAxiosSourceAction } from './types';
import type { AnyAction } from 'redux';

type InterceptorTarget = AxiosInterceptorManager<AxiosRequestConfig> | AxiosInterceptorManager<AxiosResponse>

export type ClientsList = Record<'default' | string, Client>

type InjectToInterceptor = {
  getState: () => any;
  dispatch: ThunkDispatch<any, undefined, AnyAction>;
  getSourceAction: (config: AxiosRequestConfig & {
    reduxSourceAction: TAxiosSourceAction;
  }) => TAxiosSourceAction;
}

function addInterceptor(target: InterceptorTarget, candidate: ((r: InjectToInterceptor) => any) | ({ success: (r: InjectToInterceptor) => any, error: (r: InjectToInterceptor) => any }), injectedParameters: InjectToInterceptor) {
  if (!candidate) return;
  const successInterceptor = typeof candidate === 'function' ? candidate : candidate.success;
  const errorInterceptor = candidate && (candidate as { error: (r: InjectToInterceptor) => any }).error;
  // @ts-ignore
  target.use(successInterceptor && successInterceptor.bind(null, injectedParameters),
    errorInterceptor && errorInterceptor.bind(null, injectedParameters) as any);
}

function bindInterceptors(client: AxiosInstance, injectedParameters: InjectToInterceptor, middlewareInterceptors: Interceptors = {}, clientInterceptors: Interceptors = {}) {
  [...middlewareInterceptors.request || [], ...clientInterceptors.request || []].forEach((interceptor) => {
    addInterceptor(client.interceptors.request, interceptor, injectedParameters);
  });
  [...middlewareInterceptors.response || [], ...clientInterceptors.response || []].forEach((interceptor) => {
    addInterceptor(client.interceptors.response, interceptor, injectedParameters);
  });
}

function getSourceAction(config: AxiosRequestConfig & {
  reduxSourceAction: TAxiosSourceAction;
}) {
  return config.reduxSourceAction;
}

export const multiClientMiddleware = (clients: ClientsList, customMiddlewareOptions?: Options): ThunkMiddleware => {
  const middlewareOptions = { ...defaultOptions, ...customMiddlewareOptions };
  const setupedClients: ClientsList = {};

  return ({ getState, dispatch }) => next => (action: AnyAction) => {
    if (!middlewareOptions.isAxiosRequest(action)) {
      return next(action);
    }

    const clientName = middlewareOptions.getClientName(action) || middlewareOptions.defaultClientName;

    if (!clients[clientName]) {
      throw new Error(`Client with name "${clientName}" has not been defined in middleware`);
    }

    if (!setupedClients[clientName]) {
      const clientOptions = { ...middlewareOptions, ...clients[clientName].options };
      // @ts-ignore
      if (clientOptions.interceptors) {
        // @ts-ignore
        const middlewareInterceptors = middlewareOptions.interceptors;
        const clientInterceptors = clients[clientName].options && clients[clientName].options!.interceptors;
        const injectToInterceptor = { getState, dispatch, getSourceAction };
        bindInterceptors(clients[clientName].client, injectToInterceptor, middlewareInterceptors, clientInterceptors);
      }

      setupedClients[clientName] = {
        client: clients[clientName].client,
        options: clientOptions as Options
      };
    }

    const setupedClient = setupedClients[clientName] as Client;
    const actionOptions = { ...setupedClient.options, ...setupedClient.options!.getRequestOptions!(action) };
    const [REQUEST] = getActionTypes(action, actionOptions);
    next({ ...action, type: REQUEST });

    const requestConfig = {
      ...actionOptions.getRequestConfig(action),
      reduxSourceAction: action
    };
    return setupedClient.client.request(requestConfig)
      .then(
        (response) => {
          const newAction = actionOptions.onSuccess({ action, next, response, getState, dispatch }, actionOptions);
          actionOptions.onComplete({ action: newAction, next, getState, dispatch }, actionOptions);
          return newAction;
        },
        (error) => {
          let newAction;
          if (middlewareOptions.isCancel(error)) {
            newAction = actionOptions.onCancel({ action, next, error, getState, dispatch }, actionOptions);
          } else {
            newAction = actionOptions.onError({ action, next, error, getState, dispatch }, actionOptions);
          }
          actionOptions.onComplete({ action: newAction, next, getState, dispatch }, actionOptions);
          return actionOptions.returnRejectedPromiseOnError ? Promise.reject(newAction) : newAction;
        });
  };
};

export function axiosMiddleware(client: AxiosInstance, customMiddlewareOptions?: Options, customClientOptions?: any) {
  const middlewareOptions = { ...defaultOptions, ...customMiddlewareOptions };
  const options = customClientOptions || {};
  return multiClientMiddleware({ [middlewareOptions.defaultClientName]: { client, options } }, middlewareOptions as Options);
}
