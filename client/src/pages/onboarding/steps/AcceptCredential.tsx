/* eslint-disable no-console */
import type { Character } from '../../../slices/types'
import type { Content } from '../../../utils/OnboardingUtils'
import type { CredentialRecord } from '@aries-framework/core'
import type { CredReqMetadata } from 'indy-sdk'

import { JsonTransformer } from '@aries-framework/core'
import { AnimatePresence, motion } from 'framer-motion'
import { track } from 'insights-js'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { fade, fadeX } from '../../../FramerAnimations'
import { ActionCTA } from '../../../components/ActionCTA'
import { Loader } from '../../../components/Loader'
import { Modal } from '../../../components/Modal'
import { useAppDispatch } from '../../../hooks/hooks'
import { useInterval } from '../../../hooks/useInterval'
import { useCredentials } from '../../../slices/credentials/credentialsSelectors'
import {
  deleteCredentialById,
  fetchCredentialsByConId,
  issueCredential,
} from '../../../slices/credentials/credentialsThunks'
import { useWorkflowExecution, useWorkflowExecutionId } from '../../../slices/workflows/workflowExecutionSelectors'
import { fetchWorkflowExecutionById } from '../../../slices/workflows/workflowExecutionThunks'
import { FailedRequestModal } from '../components/FailedRequestModal'
import { StarterCredentials } from '../components/StarterCredentials'
import { StepInformation } from '../components/StepInformation'

export interface Props {
  content: Content
  connectionId: string
  credentials: CredentialRecord[]
  currentCharacter: Character
}

export const AcceptCredential: React.FC<Props> = ({ content, connectionId, credentials, currentCharacter }) => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const [isRejectedModalOpen, setIsRejectedModalOpen] = useState(false)
  const [isFailedRequestModalOpen, setIsFailedRequestModalOpen] = useState(false)
  const [credentialsIssued, setCredentialsIssued] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const { isIssueCredentialLoading, error } = useCredentials()

  const showFailedRequestModal = () => setIsFailedRequestModalOpen(true)
  const closeFailedRequestModal = () => setIsFailedRequestModalOpen(false)

  const workflowExecutionId = useWorkflowExecutionId()
  const workflowExecution = useWorkflowExecution()
  const credentialsAccepted = workflowExecution.status === 'Completed'

  // useEffect(() => {
  //   if (credentials.length === 0) {
  //     currentCharacter.starterCredentials.forEach((item) => {
  //       dispatch(issueCredential({ connectionId: connectionId, cred: item }))
  //       track({
  //         id: 'credential-issued',
  //       })
  //     })
  //     setCredentialsIssued(true)
  //   }
  // }, [currentCharacter.starterCredentials, connectionId])

  // const handleCredentialTimeout = () => {
  //   if (!isIssueCredentialLoading || !error) return
  //   setErrorMsg(
  //     `The request timed out. We're sorry, but you're going to have to restart the demo. If this issue persists, please contact us.`
  //   )
  //   setIsRejectedModalOpen(true)
  // }

  // useEffect(() => {
  //   if (credentialsIssued) {
  //     setTimeout(() => {
  //       handleCredentialTimeout()
  //     }, 10000)
  //   }
  // }, [credentialsIssued, isIssueCredentialLoading])

  // useEffect(() => {
  //   if (error) {
  //     const msg = error.message ?? 'Issue Credential Error'
  //     setErrorMsg(
  //       `The request has failed with the following error: ${msg}. We're sorry, but you're going to have to restart. If this issue persists, please contact us. `
  //     )
  //     setIsRejectedModalOpen(true)
  //   }
  // }, [error])

  useInterval(
    () => {
      if (workflowExecutionId && document.visibilityState === 'visible') {
        dispatch(fetchWorkflowExecutionById(workflowExecutionId))
      }
    },
    !credentialsAccepted ? 1000 : null
  )

  // const routeError = () => {
  //   navigate('/demo')
  //   dispatch({ type: 'demo/RESET' })
  // }

  // const sendNewCredentials = () => {
  //   credentials.forEach((cred) => {
  //     if (cred.state !== 'credential-issued' && cred.state !== 'done') {
  //       dispatch(deleteCredentialById(cred.id))

  //       const newCredential = currentCharacter.starterCredentials.find((item) => {
  //         const credClass = JsonTransformer.fromJSON(cred, CredentialRecord)
  //         return (
  //           item.credentialDefinitionId ===
  //           credClass.metadata.get<CredReqMetadata>('_internal/indyCredential')?.credentialDefinitionId
  //         )
  //       })

  //       if (newCredential) dispatch(issueCredential({ connectionId: connectionId, cred: newCredential }))
  //     }
  //   })
  //   closeFailedRequestModal()
  // }

  return (
    <motion.div className="flex flex-col h-full" variants={fadeX} initial="hidden" animate="show" exit="exit">
      <StepInformation title={content.title} text={content.text} />
      <div className="flex flex-row m-auto content-center">
        <AnimatePresence exitBeforeEnter>
          <motion.div className={`flex flex-1 flex-col m-auto`} variants={fade} animate="show" exit="exit">
            <StarterCredentials
              credentialData={currentCharacter.starterCredentials}
              credentials={credentials}
              completed={credentialsAccepted}
            />
          </motion.div>
        </AnimatePresence>
      </div>
      <ActionCTA isCompleted={credentialsAccepted && credentials.length > 0} onFail={showFailedRequestModal} />
    </motion.div>
  )
}
