import type { ConnectionState } from '../../slices/connection/connectionSlice'
import type { Section as ISection, StepperItem } from '../../slices/types'
import type { CredentialRecord, ProofRecord } from '@aries-framework/core'

import { AnimatePresence, motion } from 'framer-motion'
import React, { useEffect, useState } from 'react'
import { useMediaQuery } from 'react-responsive'
import { useNavigate } from 'react-router-dom'

import { fadeExit } from '../../FramerAnimations'
import { BackButton } from '../../components/BackButton'
import { Modal } from '../../components/Modal'
import { SmallButton } from '../../components/SmallButton'
import { useAppDispatch } from '../../hooks/hooks'
import { StepType } from '../../slices/types'
import { nextStep, prevStep } from '../../slices/useCases/useCasesSlice'
import { useWorkflowExecution, useWorkflowExecutionId } from '../../slices/workflows/workflowExecutionSelectors'

import { SideView } from './SideView'
import { EndContainer } from './components/EndContainer'
import { StartContainer } from './components/StartContainer'
import { StepConnection } from './steps/StepConnection'
import { StepCredential } from './steps/StepCredential'
import { StepInformation } from './steps/StepInformation'
import { StepProof } from './steps/StepProof'
import { StepProofOOB } from './steps/StepProofOOB'

export interface Props {
  section: ISection
  connection: ConnectionState
  stepper: StepperItem[]
  stepCount: number
  sectionCount: number
  credentials: CredentialRecord[]
  proof?: ProofRecord
  proofUrl?: string
}

export const Section: React.FC<Props> = ({
  connection,
  section,
  stepper,
  stepCount,
  sectionCount,
  credentials,
  proof,
  proofUrl,
}) => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const isMobile = useMediaQuery({ query: '(max-width: 976px)' })
  const style = isMobile ? { height: '680px' } : { minHeight: '680px', height: '80vh', maxHeight: '920px' }

  const [isBackDisabled, setIsBackDisabled] = useState(false)
  const [isForwardDisabled, setIsForwardDisabled] = useState(false)

  const [leaveModal, setLeaveModal] = useState(false)
  const LEAVE_MODAL_TITLE = 'Are you sure you want to leave?'
  const LEAVE_MODAL_DESCRIPTION = `You'll be redirected to the dashboard.`

  const showLeaveModal = () => setLeaveModal(true)
  const closeLeave = () => setLeaveModal(false)

  const step = section.steps[stepCount]

  const leave = () => {
    navigate('/dashboard')
    dispatch({ type: 'clearUseCase' })
  }

  const prev = () => dispatch(prevStep())
  const next = () => dispatch(nextStep())

  const isConnectionCompleted = connection.state === 'responded' || connection.state === 'complete'
  const workflowExecutionId = useWorkflowExecutionId()
  const workflowExecution = useWorkflowExecution()
  const isProofCompleted = workflowExecution.completedActionIds.length > 2
  const credentialsReceived = workflowExecution.status === 'Completed'

  // const credentialsReceived = Object.values(credentials).every(
  //   (x) => x.state === 'credential-issued' || x.state === 'done'
  // )

  useEffect(() => {
    if (step?.type === StepType.CONNECTION) {
      if (isConnectionCompleted) {
        setIsForwardDisabled(false)
      } else {
        setIsForwardDisabled(true)
      }
    }

    if (step?.type === StepType.PROOF || step?.type === StepType.PROOF_OOB) {
      if (isProofCompleted) {
        setIsForwardDisabled(false)
      } else {
        setIsForwardDisabled(true)
      }
    }

    if (step?.type === StepType.CREDENTIAL) {
      if (credentialsReceived) {
        setIsForwardDisabled(false)
      } else {
        setIsForwardDisabled(true)
      }
    }

    // button is never disabled on INFO step
    if (step?.type === StepType.INFO) {
      setIsForwardDisabled(false)
    }

    // buttons are never disabled on the first step
    if (stepCount === 0) {
      setIsBackDisabled(true)
    } else {
      setIsBackDisabled(false)
    }
  }, [stepCount, proof, connection.state, credentials, workflowExecution])

  useEffect(() => {
    // automatically go to next step if connection is set up
    if (step?.type === StepType.CONNECTION && isConnectionCompleted) {
      next()
    }
  }, [connection.state])

  useEffect(() => {
    if (isMobile) {
      // reset mobile scroll on first & last step
      if (step.type === StepType.START || step.type === StepType.END) {
        window.scrollTo(0, 0)
      }
    }
  }, [stepCount, sectionCount])

  const renderStepItem = () => {
    if (step.type === StepType.START) {
      return (
        <StartContainer
          key={step.id}
          step={step}
          entity={section.entity}
          requestedCredentials={section.requestedCredentials}
          issueCredentials={section.issueCredentials}
        />
      )
    }
    if (step.type === StepType.END) {
      return <EndContainer key={step.id} step={step} />
    } else {
      return (
        <>
          <div key={section.id} className="flex flex-col lg:flex-row w-full h-full">
            <SideView
              key={'sideView'}
              section={section}
              entity={section.entity}
              stepper={stepper}
              sectionCount={sectionCount}
              colors={section.colors}
              stepCount={stepCount}
              showLeaveModal={showLeaveModal}
            />
            <motion.div
              key={'mainContentDiv'}
              variants={fadeExit}
              initial="hidden"
              animate="show"
              exit="exit"
              className="flex flex-col w-auto lg:w-2/3 p-8 bg-white dark:bg-animo-darkgrey rounded-lg shadow"
              style={style}
              data-cy="section"
            >
              <AnimatePresence initial={false} exitBeforeEnter onExitComplete={() => null}>
                {step.type === StepType.INFO && <StepInformation key={step.id} step={step} />}
                {step.type === StepType.CONNECTION && (
                  <StepConnection key={step.id} step={step} connection={connection} entity={section.entity} />
                )}
                {step.type === StepType.CREDENTIAL && section.issueCredentials && (
                  <StepCredential
                    key={step.id}
                    step={step}
                    connectionId={''}
                    issueCredentials={section.issueCredentials}
                    credentials={credentials}
                    proof={proof}
                  />
                )}
                {step.type === StepType.PROOF && section.requestedCredentials && (
                  <StepProof
                    key={step.id}
                    proof={proof}
                    step={step}
                    connectionId={'connection.id'}
                    requestedCredentials={section.requestedCredentials}
                    entity={section.entity}
                  />
                )}
                {step.type === StepType.PROOF_OOB && section.requestedCredentials && (
                  <StepProofOOB
                    key={step.id}
                    proof={proof}
                    proofUrl={proofUrl}
                    step={step}
                    requestedCredentials={section.requestedCredentials}
                    entity={section.entity}
                  />
                )}
              </AnimatePresence>
              <div className="flex justify-between items-center ">
                <BackButton onClick={prev} disabled={isBackDisabled} />
                <SmallButton text="NEXT" onClick={next} disabled={isForwardDisabled} data-cy="use-case-next" />
              </div>
            </motion.div>
          </div>
          {leaveModal && (
            <Modal title={LEAVE_MODAL_TITLE} description={LEAVE_MODAL_DESCRIPTION} onOk={leave} onCancel={closeLeave} />
          )}
        </>
      )
    }
  }

  return <AnimatePresence exitBeforeEnter>{step && renderStepItem()}</AnimatePresence>
}
