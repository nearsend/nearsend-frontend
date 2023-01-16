import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import createSagaMiddleware from 'redux-saga';

import rootReducer from './rootReducer';
import rootSaga from './rootSaga';

import { namespace as AddressNamespace } from './address/slice';
import { namespace as ConnectionNamespace } from './connection/slice';
import { namespace as SendTokenNamespace } from './sendToken/slice';

const persistConfig = {
  key: 'root',
  storage: storage,
  whitelist: [AddressNamespace, ConnectionNamespace, SendTokenNamespace],
  blacklist: [],
};

const root = persistReducer(persistConfig, rootReducer);
export const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: root,
  middleware: [
    ...getDefaultMiddleware({
      thunk: false,
      serializableCheck: false,
    }),
    sagaMiddleware,
  ],
  devTools: import.meta.env.DEV,
});

sagaMiddleware.run(rootSaga);

export const persistor = persistStore(store, {});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
