import type { Character } from '../../slices/types'
import type { CredentialRecord } from '@aries-framework/core'

import { AnimatePresence, motion } from 'framer-motion'
import { track } from 'insights-js'
import React, { useEffect, useState } from 'react'
import { FiLogOut } from 'react-icons/fi'
import { useMediaQuery } from 'react-responsive'
import { useNavigate } from 'react-router-dom'

import { fadeDelay, fadeExit } from '../../FramerAnimations'
import { Modal } from '../../components/Modal'
import { useAppDispatch } from '../../hooks/hooks'
import { useDarkMode } from '../../hooks/useDarkMode'
import { clearConnection } from '../../slices/connection/connectionSlice'
import { clearCredentials } from '../../slices/credentials/credentialsSlice'
import { completeOnboarding, nextOnboardingStep, prevOnboardingStep } from '../../slices/onboarding/onboardingSlice'
import { fetchAllUseCasesByCharId } from '../../slices/useCases/useCasesThunks'
import { useWorkflowExecution } from '../../slices/workflows/workflowExecutionSelectors'
import { Progress, OnboardingContent } from '../../utils/OnboardingUtils'

import { CharacterContent } from './components/CharacterContent'
import { OnboardingBottomNav } from './components/OnboardingBottomNav'
import { AcceptCredential } from './steps/AcceptCredential'
import { ChooseWallet } from './steps/ChooseWallet'
import { ConnectionComplete } from './steps/ConnectionComplete'
import { PickCharacter } from './steps/PickCharacter'
import { SetupCompleted } from './steps/SetupCompleted'
import { SetupConnection } from './steps/SetupConnection'
import { SetupStart } from './steps/SetupStart'

export interface Props {
  characters: Character[]
  currentCharacter?: Character
  connectionId?: string
  connectionState?: string
  invitationUrl?: string
  onboardingStep: number
  credentials: CredentialRecord[]
}

export const OnboardingContainer: React.FC<Props> = ({
  characters,
  currentCharacter,
  onboardingStep,
  connectionId,
  connectionState,
  invitationUrl,
  credentials,
}) => {
  const darkMode = useDarkMode()
  const dispatch = useAppDispatch()
  const workflowExecution = useWorkflowExecution()
  const connectionCompleted = workflowExecution.completedActionIds.length > 1
  const credentialsAccepted = workflowExecution.status === 'Completed'

  const isBackDisabled = [Progress.SETUP_START, Progress.ACCEPT_CREDENTIAL].includes(onboardingStep)
  const isForwardDisabled =
    onboardingStep === Progress.CHOOSE_WALLET ||
    (onboardingStep === Progress.RECEIVE_IDENTITY && !connectionCompleted) ||
    (onboardingStep === Progress.ACCEPT_CREDENTIAL && !credentialsAccepted) ||
    (onboardingStep === Progress.PICK_CHARACTER && !currentCharacter)

  const addOnboardingProgress = () => {
    dispatch(nextOnboardingStep())
    track({
      id: 'onboarding-step-completed',
      parameters: {
        step: onboardingStep.toString(),
      },
    })
  }

  const removeOnboardingProgress = () => {
    dispatch(prevOnboardingStep())
  }

  useEffect(() => {
    if (onboardingStep === Progress.RECEIVE_IDENTITY && connectionCompleted) {
      addOnboardingProgress()
    }
  }, [connectionState])

  const getComponentToRender = (progress: Progress) => {
    const components = {
      [Progress.SETUP_START]: <SetupStart key={Progress.SETUP_START} content={OnboardingContent[progress]} />,
      [Progress.CHOOSE_WALLET]: (
        <ChooseWallet
          key={Progress.CHOOSE_WALLET}
          content={OnboardingContent[progress]}
          addOnboardingProgress={addOnboardingProgress}
        />
      ),
      [Progress.PICK_CHARACTER]: (
        <PickCharacter
          key={Progress.PICK_CHARACTER}
          content={OnboardingContent[progress]}
          currentCharacter={currentCharacter}
          characters={characters}
        />
      ),
      [Progress.RECEIVE_IDENTITY]: (
        <SetupConnection
          key={Progress.RECEIVE_IDENTITY}
          content={OnboardingContent[progress]}
          connectionId={connectionId}
          invitationUrl={invitationUrl}
          connectionState={connectionState}
        />
      ),
      [Progress.CONNECTION_COMPLETE]: (
        <ConnectionComplete key={Progress.CONNECTION_COMPLETE} content={OnboardingContent[progress]} />
      ),
      [Progress.ACCEPT_CREDENTIAL]: currentCharacter && (
        <AcceptCredential
          key={Progress.ACCEPT_CREDENTIAL}
          content={OnboardingContent[progress]}
          connectionId={''}
          credentials={credentials}
          currentCharacter={currentCharacter}
        />
      ),
      [Progress.SETUP_COMPLETED]: currentCharacter && (
        <SetupCompleted
          key={Progress.SETUP_COMPLETED}
          content={OnboardingContent[progress]}
          characterName={currentCharacter.name}
        />
      ),
    }

    return components[progress]
  }

  const getImageToRender = (progress: Progress) => {
    const components = {
      [Progress.SETUP_START]: (
        <motion.img
          variants={fadeExit}
          initial="hidden"
          animate="show"
          exit="exit"
          className="p-4"
          key={Progress.SETUP_START}
          src={darkMode ? OnboardingContent[progress].iconDark : OnboardingContent[progress].iconLight}
        />
      ),
      [Progress.CHOOSE_WALLET]: (
        <motion.img
          variants={fadeExit}
          initial="hidden"
          animate="show"
          exit="exit"
          className="p-4"
          key={Progress.CHOOSE_WALLET}
          src={darkMode ? OnboardingContent[progress].iconDark : OnboardingContent[progress].iconLight}
        />
      ),
      [Progress.PICK_CHARACTER]: <CharacterContent key={Progress.PICK_CHARACTER} character={currentCharacter} />,
      [Progress.RECEIVE_IDENTITY]: (
        <motion.img
          variants={fadeExit}
          initial="hidden"
          animate="show"
          exit="exit"
          className="p-4"
          key={Progress.RECEIVE_IDENTITY}
          src={darkMode ? OnboardingContent[progress].iconDark : OnboardingContent[progress].iconLight}
        />
      ),
      [Progress.CONNECTION_COMPLETE]: (
        <motion.img
          variants={fadeExit}
          initial="hidden"
          animate="show"
          exit="exit"
          className="p-4"
          key={Progress.CONNECTION_COMPLETE}
          src={darkMode ? OnboardingContent[progress].iconDark : OnboardingContent[progress].iconLight}
        />
      ),
      [Progress.ACCEPT_CREDENTIAL]: currentCharacter && connectionId && (
        <motion.img
          variants={fadeExit}
          initial="hidden"
          animate="show"
          exit="exit"
          className="p-4"
          key={Progress.ACCEPT_CREDENTIAL}
          src={darkMode ? OnboardingContent[progress].iconDark : OnboardingContent[progress].iconLight}
        />
      ),
      [Progress.SETUP_COMPLETED]: (
        <motion.img
          variants={fadeExit}
          initial="hidden"
          animate="show"
          exit="exit"
          className="p-4"
          key={Progress.SETUP_COMPLETED}
          src={darkMode ? OnboardingContent[progress].iconDark : OnboardingContent[progress].iconLight}
        />
      ),
    }

    return components[progress]
  }

  const navigate = useNavigate()
  const onboardingCompleted = () => {
    if (connectionId && currentCharacter) {
      navigate('/dashboard')
      dispatch(clearCredentials())
      dispatch(clearConnection())
      dispatch(completeOnboarding())
      dispatch(fetchAllUseCasesByCharId(currentCharacter.id))
    } else {
      // something went wrong so reset
      dispatch({ type: 'demo/RESET' })
    }
  }

  const isMobile = useMediaQuery({ query: '(max-width: 976px)' })

  const style = isMobile ? { minHeight: '85vh' } : { minHeight: '620px', height: '75vh', maxHeight: '940px' }

  const [leaveModal, setLeaveModal] = useState(false)
  const LEAVE_MODAL_TITLE = 'Are you sure you want to leave?'
  const LEAVE_MODAL_DESCRIPTION = `You're progress will be lost and you'll be redirected to the homepage.`
  const showLeaveModal = () => setLeaveModal(true)
  const closeLeave = () => setLeaveModal(false)

  const leave = () => {
    navigate('/')
    dispatch({ type: 'demo/RESET' })
  }

  return (
    <motion.div
      className="flex flex-row h-full justify-between bg-white dark:bg-animo-darkgrey rounded-lg p-2 w-full sxl:w-5/6 shadow"
      style={style}
    >
      <div className="flex flex-col grid justify-items-end w-full lg:w-2/3 px-8">
        <div className="w-full">
          <motion.p variants={fadeDelay}>
            <FiLogOut onClick={showLeaveModal} className="inline h-12 cursor-pointer dark:text-white" />
          </motion.p>
        </div>
        <AnimatePresence exitBeforeEnter>{getComponentToRender(onboardingStep)}</AnimatePresence>
        <OnboardingBottomNav
          onboardingStep={onboardingStep}
          addOnboardingStep={addOnboardingProgress}
          removeOnboardingStep={removeOnboardingProgress}
          forwardDisabled={isForwardDisabled}
          backDisabled={isBackDisabled}
          onboardingCompleted={onboardingCompleted}
        />
      </div>
      <div className="bg-animo-white dark:bg-animo-black hidden lg:flex lg:w-1/3 rounded-r-lg flex-col justify-center h-full select-none">
        <AnimatePresence exitBeforeEnter>{getImageToRender(onboardingStep)}</AnimatePresence>
      </div>
      {leaveModal && (
        <Modal title={LEAVE_MODAL_TITLE} description={LEAVE_MODAL_DESCRIPTION} onOk={leave} onCancel={closeLeave} />
      )}
    </motion.div>
  )
}
