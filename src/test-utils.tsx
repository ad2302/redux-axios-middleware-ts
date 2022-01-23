import React from 'react'
import { render as rtlRender, RenderOptions } from '@testing-library/react'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
// Import your own reducer
import userReducer from './userSlice'


function render(
  ui: React.ReactElement,
  {
    // @ts-ignore
    preloadedState,
    // @ts-ignore
    store = configureStore({ reducer: { user: userReducer }, preloadedState }),
    ...renderOptions
  }:RenderOptions = {}
) {
  function Wrapper({ children }:React.PropsWithChildren<any>) {
    return <Provider store={store}>{children}</Provider>
  }
  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions })
}

// re-export everything
export * from '@testing-library/react'
// override render method
export { render }