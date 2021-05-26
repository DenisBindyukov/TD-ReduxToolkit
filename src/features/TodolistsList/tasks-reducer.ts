import {
    TaskPriorities,
    TaskStatuses,
    TaskType,
    todolistsAPI,
    UpdateTaskModelType
} from '../../api/todolists-api'
import {Dispatch} from 'redux'
import {AppRootStateType} from '../../app/store'
import {setAppStatusAC} from '../../app/app-reducer'
import {handleServerAppError, handleServerNetworkError} from '../../utils/error-utils'
import {addTodolistAC, removeTodolistAC, setTodolistsAC} from './todolists-reducer'
import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";

const initialState: TasksStateType = {};


//Create an Thunk before the reducer otherwise the Thunk won't work
export const fetchTasksTC = createAsyncThunk('tasks/fetchTasks', (todolistId: string, thunkAPI) => {
    thunkAPI.dispatch(setAppStatusAC({status: 'loading'}))
    todolistsAPI.getTasks(todolistId)
        .then((res) => {
            const tasks = res.data.items
            thunkAPI.dispatch(setTasksAC({tasks, todolistId}))
            thunkAPI.dispatch(setAppStatusAC({status: 'succeeded'}))
        })
})

const slice = createSlice({
    name: 'tasks',
    initialState: initialState,
    reducers: {
        removeTaskAC(state, action: PayloadAction<{ taskId: string, todolistId: string }>) {
            const task = state[action.payload.todolistId];
            //findIndex-находит  индекс таски из условия t.id === action.payload.taskId
            const index = task.findIndex(t => t.id === action.payload.taskId);
            if (index > -1) {
                //splice удаляет с указанного индекса(первый параметр) до указонное количество индексов указанных во втором параметре.
                task.splice(index, 1);
            }
        },
        addTaskAC(state, action: PayloadAction<TaskType>) {
            //unshift добовляет значение в конец массива.
            state[action.payload.todoListId].unshift(action.payload);
        },
        updateTaskAC(state, action: PayloadAction<{ taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string }>) {
            const task = state[action.payload.todolistId];
            const index = task.findIndex(t => t.id === action.payload.taskId);
            if (index > -1) {
                task[index] = {...task[index], ...action.payload.domainModel}
            }
        },
        setTasksAC(state, action: PayloadAction<{ tasks: Array<TaskType>, todolistId: string }>) {
            state[action.payload.todolistId] = action.payload.tasks
        }
    },
    extraReducers: (builder) => {
        builder.addCase(addTodolistAC, (state, action) => {
            state[action.payload.todolist.id] = []
        });
        builder.addCase(removeTodolistAC, (state, action) => {
            delete state[action.payload.id]
        });
        builder.addCase(setTodolistsAC, (state, action) => {
            action.payload.todolists.forEach((tl: any) => {
                state[tl.id] = []
            });
        });
    }
});

export const {removeTaskAC, addTaskAC, updateTaskAC, setTasksAC} = slice.actions;

export const tasksReducer = slice.reducer;


export const removeTaskTC = (taskId: string, todolistId: string) => (dispatch: Dispatch) => {
    todolistsAPI.deleteTask(todolistId, taskId)
        .then(res => {
            const action = removeTaskAC({taskId, todolistId})
            dispatch(action)
        })
}
export const addTaskTC = (title: string, todolistId: string) => (dispatch: Dispatch) => {
    dispatch(setAppStatusAC({status: 'loading'}))
    todolistsAPI.createTask(todolistId, title)
        .then(res => {
            if (res.data.resultCode === 0) {
                const task = res.data.data.item
                const action = addTaskAC(task)
                dispatch(action)
                dispatch(setAppStatusAC({status: 'succeeded'}))
            } else {
                handleServerAppError(res.data, dispatch);
            }
        })
        .catch((error) => {
            handleServerNetworkError(error, dispatch)
        })
}
export const updateTaskTC = (taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string) =>
    (dispatch: Dispatch, getState: () => AppRootStateType) => {
        const state = getState()
        const task = state.tasks[todolistId].find(t => t.id === taskId)
        if (!task) {
            //throw new Error("task not found in the state");
            console.warn('task not found in the state')
            return
        }

        const apiModel: UpdateTaskModelType = {
            deadline: task.deadline,
            description: task.description,
            priority: task.priority,
            startDate: task.startDate,
            title: task.title,
            status: task.status,
            ...domainModel
        }

        todolistsAPI.updateTask(todolistId, taskId, apiModel)
            .then(res => {
                if (res.data.resultCode === 0) {
                    dispatch(updateTaskAC({taskId, domainModel, todolistId}))
                } else {
                    handleServerAppError(res.data, dispatch);
                }
            })
            .catch((error) => {
                handleServerNetworkError(error, dispatch);
            })
    }

// types
export type UpdateDomainTaskModelType = {
    title?: string
    description?: string
    status?: TaskStatuses
    priority?: TaskPriorities
    startDate?: string
    deadline?: string
}
export type TasksStateType = {
    [key: string]: Array<TaskType>
}

