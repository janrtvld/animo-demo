import { createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

export const fetchWorkflowExecutionById = createAsyncThunk(
  'workflowExecutions/fetchWorkflowExecutionById',
  async (executionId: string) => {
    const executionsReq = await fetch(`http://localhost:5000/executions/${executionId}`, {
      method: 'GET',
    })
    const data = await executionsReq.json()
    return data
  }
)

export const executeWorkflow = createAsyncThunk(
  'workflowExecutions/executeWorkflow',
  async (input: { workflowRecordId: string; body?: Record<string, unknown> }) => {
    const createExecutionResp = await axios(`http://localhost:5000/execute/${input.workflowRecordId}`, {
      method: 'POST',
      data: input.body,
    })

    const data = await createExecutionResp.data
    return data[0]
  }
)
