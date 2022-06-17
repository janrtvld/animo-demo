import type { RootState } from '../../store/configureStore'

import { useSelector } from 'react-redux'

export const useWorkflowExecution = () => useSelector((state: RootState) => state.workflowExecution)
export const useWorkflowExecutionId = () => useSelector((state: RootState) => state.workflowExecution.id)
