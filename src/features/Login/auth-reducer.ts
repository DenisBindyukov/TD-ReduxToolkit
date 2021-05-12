import { Dispatch } from 'redux'
import {setAppStatusAC} from '../../app/app-reducer'
import {authAPI} from "../../api/todolists-api";
import {handleServerAppError, handleServerNetworkError} from "../../utils/error-utils";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";

const initialState = {
    isLoggedIn: false
}

//type InitialStateType = typeof initialState

const slice = createSlice({
    name: 'auth',
    initialState: initialState,
    reducers: {
        setIsLoggedInAC(state, action: PayloadAction<{value: boolean}>) {
             state.isLoggedIn = action.payload.value
        }
    }

})

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
export const loginTC = (data: any) => (dispatch: Dispatch) => {
    dispatch(setAppStatusAC('loading'))
    authAPI.login(data)
        .then((res) => {
            if (res.data.resultCode === 0) {
                dispatch(setIsLoggedInAC({value: false}));
                dispatch(setAppStatusAC('succeeded'))
            } else {
                handleServerAppError(res.data, dispatch)
            }
        })
        .catch((error) => {
            handleServerNetworkError(error, dispatch)
        })
}


export const logout = () => (dispatch: Dispatch) => {
    dispatch(setAppStatusAC('loading'))
    authAPI.logout()
        .then((res) => {
            if (res.data.resultCode === 0) {
                dispatch(setIsLoggedInAC({value: false}));
                dispatch(setAppStatusAC('succeeded'))
            } else {
                handleServerAppError(res.data, dispatch);
            }
        })
        .catch((error) => {
            handleServerNetworkError(error, dispatch);
        })
}
// types


