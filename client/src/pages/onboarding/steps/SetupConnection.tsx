import type { Content } from '../../../utils/OnboardingUtils'

import { motion } from 'framer-motion'
import React, { useEffect } from 'react'
import { FiExternalLink } from 'react-icons/fi'
import { useMediaQuery } from 'react-responsive'

import { fade, fadeX } from '../../../FramerAnimations'
import { Loader } from '../../../components/Loader'
import { QRCode } from '../../../components/QRCode'
import { useAppDispatch } from '../../../hooks/hooks'
import { useInterval } from '../../../hooks/useInterval'
import { useCharacters, useCurrentCharacter } from '../../../slices/characters/charactersSelectors'
import { createInvitation, fetchConnectionById } from '../../../slices/connection/connectionThunks'
import { nextOnboardingStep, setOnboardingConnectionId } from '../../../slices/onboarding/onboardingSlice'
import { setConnectionDate } from '../../../slices/preferences/preferencesSlice'
import { useWorkflowExecution, useWorkflowExecutionId } from '../../../slices/workflows/workflowExecutionSelectors'
import { executeWorkflow, fetchWorkflowExecutionById } from '../../../slices/workflows/workflowExecutionThunks'
import { StepInformation } from '../components/StepInformation'

export interface Props {
  content: Content
  connectionId?: string
  invitationUrl?: string
  connectionState?: string
}

export const SetupConnection: React.FC<Props> = ({ content, connectionId, invitationUrl, connectionState }) => {
  const dispatch = useAppDispatch()

  const char = useCurrentCharacter()
  const workflowExecutionId = useWorkflowExecutionId()
  const workflowExecution = useWorkflowExecution()
  const connectionCompleted = workflowExecution.completedActionIds.length > 1

  const actionResult =
    workflowExecution.status === 'WaitingForTrigger' &&
    (workflowExecution.payload.actions.createConnection as {
      output: {
        connectionId: string
        invitationUrl: string
      }
    })

  useEffect(() => {
    if (!connectionCompleted)
      dispatch(
        executeWorkflow({
          workflowRecordId: '62ab040b71af9750f3f2b14d',
          body: {
            name: char?.name,
            dateOfBirth: '12000101',
            street: 'Ambachstraat 91',
            city: 'Utrecht',
            nationality: 'The Netherlands',
          },
        })
      )
  }, [])

  useEffect(() => {
    if (connectionCompleted) dispatch(nextOnboardingStep())
  }, [connectionCompleted])

  useEffect(() => {
    if (actionResult && actionResult.output.connectionId) {
      dispatch(setOnboardingConnectionId(actionResult.output.connectionId))
      const date = new Date()
      dispatch(setConnectionDate(date))
    }
  }, [actionResult])

  useInterval(
    () => {
      if (workflowExecutionId && document.visibilityState === 'visible') {
        dispatch(fetchWorkflowExecutionById(workflowExecutionId))
      }
    },
    !connectionCompleted ? 1000 : null
  )

  const renderQRCode = actionResult ? (
    <QRCode invitationUrl={actionResult.output.invitationUrl} connectionState={connectionState} />
  ) : (
    <div className="m-auto">
      <Loader />
    </div>
  )

  const deepLink =
    actionResult && `didcomm://aries_connection_invitation?${actionResult.output.invitationUrl?.split('?')[1]}`
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' })

  const renderCTA =
    !connectionCompleted && deepLink ? (
      <motion.div variants={fade} key="openWallet">
        <p>
          Scan the QR-code with your <a href={deepLink}>wallet {isMobile && 'or'} </a>
        </p>
        {isMobile && (
          <a href={deepLink} className="underline underline-offset-2 mt-2">
            open in wallet
            <FiExternalLink className="inline pb-1" />
          </a>
        )}
      </motion.div>
    ) : (
      <motion.div variants={fade} key="ctaCompleted">
        <p>Success! You can continue.</p>
      </motion.div>
    )

  return (
    <motion.div
      className="flex flex-col h-full  dark:text-white"
      variants={fadeX}
      initial="hidden"
      animate="show"
      exit="exit"
    >
      <StepInformation title={content.title} text={content.text} />
      {renderQRCode}
      <div className="flex flex-col mt-4 text-center text-sm md:text-base font-semibold">{renderCTA}</div>
    </motion.div>
  )
}
