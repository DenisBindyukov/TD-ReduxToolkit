import {Dispatch} from 'redux'
import {setAppStatusAC} from '../../app/app-reducer'
import {authAPI, LoginParamsType} from "../../api/todolists-api";
import {handleServerAppError, handleServerNetworkError} from "../../utils/error-utils";
import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";

const initialState = {
    isLoggedIn: false
}

type InitialStateType = typeof initialState

export const loginTC = createAsyncThunk('auth/login', async (param: LoginParamsType, thunkAPI) => {

    thunkAPI.dispatch(setAppStatusAC({status: 'loading'}));
    try {
        const res = await authAPI.login(param);

        if (res.data.resultCode === 0) {
            thunkAPI.dispatch(setAppStatusAC({status: 'succeeded'}));
            return  {isLoggedIn: true};
        } else {
            handleServerAppError(res.data, thunkAPI.dispatch);
            return  {isLoggedIn: false};
        }
    } catch (error) {
        handleServerNetworkError(error, thunkAPI.dispatch);
        return  {isLoggedIn: false};
    }
});


const slice = createSlice({
    name: 'auth',
    initialState: initialState,
    reducers: {
        setIsLoggedInAC(state: InitialStateType, action: PayloadAction<{ value: boolean }>) {
            state.isLoggedIn = action.payload.value;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(loginTC.fulfilled, (state, action) => {
            if (action.payload) {
                state.isLoggedIn = action.payload.isLoggedIn
            }
        });
        }
});

export const {setIsLoggedInAC} = slice.actions;

export const authReducer = slice.reducer; /*(state: InitialStateType = initialState, action: ActionsType): InitialStateType => {
  switch (action.type) {
      case 'login/SET-IS-LOGGED-IN':
          return { ...state, isLoggedIn: action.value}
      default:
          return state
  }
}*/

// actions

// thunks
export const loginTC_ = (data: LoginParamsType) => (dispatch: Dispatch) => {
    dispatch(setAppStatusAC({status: 'loading'}))
    authAPI.login(data)
        .then((res) => {
            if (res.data.resultCode === 0) {
                dispatch(setIsLoggedInAC({value: true}));
                dispatch(setAppStatusAC({status: 'succeeded'}));
            } else {
                handleServerAppError(res.data, dispatch);
            }
        })
        .catch((error) => {
            handleServerNetworkError(error, dispatch);
        })
};


export const logout = () => (dispatch: Dispatch) => {
    dispatch(setAppStatusAC({status: 'loading'}))
    authAPI.logout()
        .then((res) => {
            if (res.data.resultCode === 0) {
                dispatch(setIsLoggedInAC({value: false}));
                dispatch(setAppStatusAC({status: 'succeeded'}))
            } else {
                handleServerAppError(res.data, dispatch);
            }
        })
        .catch((error) => {
            handleServerNetworkError(error, dispatch);
        })
};
// types


