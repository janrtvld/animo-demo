import { combineReducers } from 'redux'

import charactersSlice from './characters/charactersSlice'
import connectionSlice from './connection/connectionSlice'
import credentialsSlice from './credentials/credentialsSlice'
import onboardingSlice from './onboarding/onboardingSlice'
import preferencesSlice from './preferences/preferencesSlice'
import proofSlice from './proof/proofSlice'
import sectionSlice from './section/sectionSlice'
import useCaseSlice from './useCases/useCasesSlice'
import walletsSlice from './wallets/walletsSlice'
import executionsSlice from './workflows/workflowExecutionSlice'

export const VERSION = 4

const rootReducer = combineReducers({
  wallets: walletsSlice,
  characters: charactersSlice,
  connection: connectionSlice,
  credentials: credentialsSlice,
  onboarding: onboardingSlice,
  preferences: preferencesSlice,
  proof: proofSlice,
  section: sectionSlice,
  useCases: useCaseSlice,
  workflowExecution: executionsSlice,
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pReducer = (state: any, action: any) => {
  if (action.type === 'persist/REHYDRATE') {
    const storageVersion = action.payload?._persist.version

    if (storageVersion !== VERSION) {
      return rootReducer(undefined, action)
    }

    return rootReducer(action.payload, action)
  }

  if (action.type === 'demo/RESET') {
    return rootReducer(undefined, action)
  }

  return rootReducer(state, action)
}

export default pReducer
