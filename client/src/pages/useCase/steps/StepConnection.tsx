import type { ConnectionState } from '../../../slices/connection/connectionSlice'
import type { Entity, Step } from '../../../slices/types'

import { motion } from 'framer-motion'
import React, { useEffect } from 'react'
import { FiExternalLink } from 'react-icons/fi'
import { useMediaQuery } from 'react-responsive'

import { fade, fadeX } from '../../../FramerAnimations'
import { Loader } from '../../../components/Loader'
import { QRCode } from '../../../components/QRCode'
import { useAppDispatch } from '../../../hooks/hooks'
import { useInterval } from '../../../hooks/useInterval'
import { useCurrentCharacter } from '../../../slices/characters/charactersSelectors'
import { createInvitation, fetchConnectionById } from '../../../slices/connection/connectionThunks'
import { nextStep } from '../../../slices/useCases/useCasesSlice'
import { useWorkflowExecution, useWorkflowExecutionId } from '../../../slices/workflows/workflowExecutionSelectors'
import { executeWorkflow, fetchWorkflowExecutionById } from '../../../slices/workflows/workflowExecutionThunks'
import { StepInfo } from '../components/StepInfo'

export interface Props {
  step: Step
  connection: ConnectionState
  entity: Entity
}

export const StepConnection: React.FC<Props> = ({ step, connection, entity }) => {
  const dispatch = useAppDispatch()
  const { id, state, invitationUrl } = connection
  const isCompleted = state === 'responded' || state === 'complete'

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
    if (connectionCompleted) dispatch(nextStep())
  }, [connectionCompleted])

  useEffect(() => {
    const today = new Date()

    if (!connectionCompleted)
      dispatch(
        executeWorkflow({
          workflowRecordId: '62ad88c0d9d0871be722a396',
          body: {
            date: today,
          },
        })
      )
  }, [])

  useInterval(
    () => {
      if (workflowExecutionId && document.visibilityState === 'visible') {
        dispatch(fetchWorkflowExecutionById(workflowExecutionId))
      }
    },
    !connectionCompleted ? 1000 : null
  )

  const renderQRCode = actionResult ? (
    <QRCode invitationUrl={actionResult.output.invitationUrl} connectionState={''} />
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
    <motion.div variants={fadeX} initial="hidden" animate="show" exit="exit" className="flex flex-col h-full">
      <StepInfo title={step.title} description={step.description} />
      {renderQRCode}
      <div className="flex flex-col my-4 text-center font-semibold">{renderCTA}</div>
    </motion.div>
  )
}
