import { expect, use } from 'chai';
import { getActionTypes } from './getActionTypes';
import {
  isAxiosRequest,
  getRequestConfig,
  onSuccess,
  onError,
} from './defaults';
import { AxiosAction } from './types';
import { AnyAction, Dispatch } from 'redux';

import chaiShallowDeepEqual from 'chai-shallow-deep-equal';

use(chaiShallowDeepEqual);

describe('defaults', () => {
  describe('isAxiosRequest', () => {
    it('should check valid axios request', () => {
      const action = { type: '', payload: { request: {} } };
      expect(isAxiosRequest(action)).to.be.ok;
    });

    it('should check valid axios request', () => {
      const action = { type: '', payload: {} };
      expect(isAxiosRequest(action)).to.be.not.ok;
    });
  });

  describe('getRequestConfig', () => {
    it('should return request config', () => {
      const request = {
        url: '/abc',
      };
      const action: AxiosAction = { type: '', payload: { request } };
      // @ts-ignore
      expect(getRequestConfig(action)).to.equal(request);
    });
  });

  describe('onSuccess', () => {
    let resultAction: any | null = null;
    const next: Dispatch = <T>(action: T) => (resultAction = action);
    const response = {
      data: [1, 2, 3],
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    };

    beforeEach(() => {
      resultAction = null;
    });

    it('should fire action with response as payload', () => {
      const action = {
        type: 'REQUEST',
        payload: {
          request: {
            url: '/request-url',
          },
        },
      };

      onSuccess({ action, next, response }, {});
      expect(resultAction).to.shallowDeepEqual({
        type: getActionTypes(action)[1],
        payload: response,
      });
    });

    it('should move previous action to meta', () => {
      const action = {
        type: 'REQUEST',
        payload: {
          moveKey: 'this will move to meta',
          request: {
            url: '/request-url',
          },
        },
      };

      onSuccess({ action, next, response }, {});
      expect(resultAction).to.shallowDeepEqual({
        meta: { previousAction: action },
      });
    });
  });

  describe('onError', () => {
    let resultAction: AnyAction | null = null;
    const next = (action: AnyAction) => (resultAction = action);
    const error = {
      response: {
        data: ['Error1', 'Error2'],
        status: 400,
        statusTest: 'BAD_REQUEST',
        headers: {},
        config: {},
      },
    };

    beforeEach(() => {
      resultAction = null;
    });

    it('should fire action with error', () => {
      const action = {
        type: 'REQUEST',
        payload: {
          request: {
            url: '/request-url',
          },
        },
      };
      // @ts-ignore
      onError({ action, next, error }, {});

      expect(resultAction).to.shallowDeepEqual({
        type: getActionTypes(action)[2],
        error,
      });
    });

    it('should move previous action to meta', () => {
      const action = {
        type: 'REQUEST',
        payload: {
          request: {
            url: '/request-url',
          },
        },
      };
      // @ts-ignore
      onError({ action, next, error }, {});
      expect(resultAction).to.shallowDeepEqual({
        meta: { previousAction: action },
      });
    });
  });
});
