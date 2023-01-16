import { setAppNetwork } from 'store/address/slice';
import { put, takeLatest } from 'redux-saga/effects';
import { logout, logoutSuccess } from './slice';
import { handleClearConnectedWalletType } from 'store/connection/slice';

function* logoutSaga() {
  yield put(logoutSuccess());
  yield put(handleClearConnectedWalletType());
  yield put(setAppNetwork(undefined));
}

export function* watchAddress() {
  yield takeLatest(logout, logoutSaga);
}
