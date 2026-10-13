import React from 'react';

export const isFragment = (object: any): boolean => {
  return object?.type === React.Fragment || object?.type === Symbol.for('react.fragment');
};

export const isElement = (object: any): boolean => {
  return React.isValidElement(object);
};

export const isValidElementType = (type: any): boolean => {
  return (
    typeof type === 'string' ||
    typeof type === 'function' ||
    typeof type === 'symbol' ||
    (typeof type === 'object' && type !== null)
  );
};

export default {
  isFragment,
  isElement,
  isValidElementType,
};
