import { Options } from './types';

export const SUCCESS_SUFFIX = '_SUCCESS';
export const ERROR_SUFFIX = '_FAIL';
export const CANCEL_SUFFIX = '_CANCEL';
type ActionTypeConfigSingle = { type: string };
type ActionTypeConfigMultiple = { types: string[] };
export const getActionTypes = (
  action: ActionTypeConfigSingle | ActionTypeConfigMultiple,
  {
    errorSuffix = ERROR_SUFFIX,
    successSuffix = SUCCESS_SUFFIX,
    cancelSuffix = CANCEL_SUFFIX,
  }: Partial<
    Pick<Options, 'errorSuffix' | 'successSuffix' | 'cancelSuffix'>
  > = {}
): string[] => {
  let types;
  if (typeof (action as ActionTypeConfigSingle).type !== 'undefined') {
    const { type } = action as ActionTypeConfigSingle;
    types = [
      type,
      `${type}${successSuffix}`,
      `${type}${errorSuffix}`,
      `${type}${cancelSuffix}`,
    ];
  } else if (
    typeof (action as ActionTypeConfigMultiple).types !== 'undefined'
  ) {
    types = (action as ActionTypeConfigMultiple).types;
  } else {
    throw new Error(
      'Action which matched axios middleware needs to have "type" or "types" key which is not null'
    );
  }
  return types;
};
