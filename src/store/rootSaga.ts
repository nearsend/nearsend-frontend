import { all } from 'redux-saga/effects';
import { watchAddress } from './address/saga';

function* rootSaga() {
  yield all([watchAddress()]);
}
export default rootSaga;
