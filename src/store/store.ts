import { configureStore } from '@reduxjs/toolkit';
import accountInfoReducer from './slices/accountInfoSlice';
import characterReducer from './slices/characterSlice';
import balanceReducer from './slices/balanceSlice';
import chatSliceReducer from './slices/chatSlice';

const store = configureStore({
	reducer: {
		accountInfo: accountInfoReducer,
		character: characterReducer,
		balance: balanceReducer,
		chatHistory: chatSliceReducer,
	},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
