import { createSlice } from '@reduxjs/toolkit';
import { LANGUAGE } from 'constants/index';

export interface Language {
  lang: string;
}

const initialState: Language = {
  lang: LANGUAGE.EN,
};

export const LanguageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setLanguage: (state: Language, action) => ({
      ...state,
      lang: action.payload,
    }),
  },
});

export const { setLanguage } = LanguageSlice.actions;

export const namespace = 'LanguageSlice';

export default LanguageSlice.reducer;
