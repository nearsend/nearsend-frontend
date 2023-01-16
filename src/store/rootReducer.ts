import { combineReducers } from 'redux';

import AddressSlice, { namespace as AddressNamespace } from './address/slice';
import ConnectionSlice, { namespace as ConnectionNamespace } from './connection/slice';
import BalanceListSlice, { namespace as BalanceListNamespace } from './balance/slice';
import LanguageSlice, { namespace as LanguageNamespace } from './language/slice';
import GlobalSlice, { namespace as GlobalNamespace } from './global/slice';
import SendTokenSlice, { namespace as SendTokenNamespace } from './sendToken/slice';

export default combineReducers({
  [AddressNamespace]: AddressSlice,
  [ConnectionNamespace]: ConnectionSlice,
  [BalanceListNamespace]: BalanceListSlice,
  [LanguageNamespace]: LanguageSlice,
  [GlobalNamespace]: GlobalSlice,
  [SendTokenNamespace]: SendTokenSlice,
});
