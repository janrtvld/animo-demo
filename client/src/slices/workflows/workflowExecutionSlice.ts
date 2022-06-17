import { createSlice } from '@reduxjs/toolkit'

import { fetchWorkflowExecutionById, executeWorkflow } from './workflowExecutionThunks'

interface WorkflowExecutionState {
  id: string
  status: string
  workflowRecordId: string
  completedActionIds: string[]
  created: number
  startTime?: Date
  endTime?: Date
  payload: {
    inputs: Record<string, unknown>
    actions: Record<string, unknown>
  }
  isLoading: boolean
}

const initialState: WorkflowExecutionState = {
  id: '',
  status: '',
  workflowRecordId: '',
  completedActionIds: [],
  created: 0,
  payload: {
    inputs: {},
    actions: {},
  },
  isLoading: false,
}

const workflowExecutionSlice = createSlice({
  name: 'workflowExecutions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(executeWorkflow.pending, (state) => {
        state.isLoading = true
      })
      .addCase(executeWorkflow.fulfilled, (state, action) => {
        state.isLoading = false
        state.id = action.payload.id
        state.status = action.payload.status
        state.workflowRecordId = action.payload.workflowRecordId
        state.completedActionIds = action.payload.completedActionIds
        state.created = action.payload.created
        state.startTime = action.payload.startTime
        state.endTime = action.payload.endTime
        state.payload = action.payload.payload
      })
      .addCase(fetchWorkflowExecutionById.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchWorkflowExecutionById.fulfilled, (state, action) => {
        state.isLoading = false
        state.id = action.payload.id
        state.status = action.payload.status
        state.workflowRecordId = action.payload.workflowRecordId
        state.completedActionIds = action.payload.completedActionIds
        state.created = action.payload.created
        state.startTime = action.payload.startTime
        state.endTime = action.payload.endTime
        state.payload = action.payload.payload
      })
      .addCase('clearWorkflowExecution', (state) => {
        state = initialState
      })
  },
})

export default workflowExecutionSlice.reducer
