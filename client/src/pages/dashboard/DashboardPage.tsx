import { AnimatePresence, motion } from 'framer-motion'
import { track } from 'insights-js'
import React, { useEffect } from 'react'
import { useMediaQuery } from 'react-responsive'
import { useNavigate } from 'react-router-dom'

import { page } from '../../FramerAnimations'
import { Modal } from '../../components/Modal'
import { SmallButtonText } from '../../components/SmallButtonText'
import { useAppDispatch } from '../../hooks/hooks'
import { useTitle } from '../../hooks/useTitle'
import { useCurrentCharacter } from '../../slices/characters/charactersSelectors'
import { useCredentials } from '../../slices/credentials/credentialsSelectors'
import { usePreferences } from '../../slices/preferences/preferencesSelectors'
import { setDemoCompleted } from '../../slices/preferences/preferencesSlice'
import { useAllUseCases } from '../../slices/useCases/useCasesSelectors'
import { fetchAllUseCasesByCharId } from '../../slices/useCases/useCasesThunks'
import { clearExecution } from '../../slices/workflows/workflowExecutionSlice'
import { Footer } from '../landing/components/Footer'
import { NavBar } from '../landing/components/Navbar'

import { DashboardCard } from './components/DashboardCard'
import { DemoCompletedModal } from './components/DemoCompletedModal'
import { ProfileCard } from './components/ProfileCard'
import { UseCaseContainer } from './components/UseCaseContainer'

export const DashboardPage: React.FC = () => {
  useTitle('Dashboard | Animo Self-Sovereign Identity Demo')

  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { issuedCredentials } = useCredentials()
  const { completedUseCaseSlugs, demoCompleted } = usePreferences()
  const currentCharacter = useCurrentCharacter()
  const useCases = useAllUseCases()

  useEffect(() => {
    dispatch({ type: 'clearWorkflowExecution' })
    dispatch(clearExecution())

    // if user doesn't come from onboarding flow
    if (useCases.length === 0 && currentCharacter) {
      dispatch(fetchAllUseCasesByCharId(currentCharacter.id))
    }
  }, [])

  useEffect(() => {
    if (completedUseCaseSlugs.length !== 0 && completedUseCaseSlugs.length === useCases.length) {
      dispatch(setDemoCompleted())
    }
  }, [completedUseCaseSlugs, useCases])

  const isMobile = useMediaQuery({ query: '(max-width: 976px)' })

  const dashboardCard = (
    <DashboardCard
      title="Get to know Animo."
      info="We’ve a lot more going on then just this (awesome) demo and we would love to discuss self-sovereign identity with you. Get in touch!"
      button={
        <SmallButtonText text="CONTACT" onClick={() => window.open('https://animo.id', '_blank')} disabled={false} />
      }
    />
  )

  const ERROR_TITLE = `Woops...`
  const ERROR_DESCRIPTION = `That's not gone well. Please restart the demo.`
  const routeError = () => {
    navigate('/demo')
    dispatch({ type: 'demo/RESET' })
  }

  const completeDemo = () => {
    navigate('/')
    dispatch({ type: 'demo/RESET' })

    if (currentCharacter) {
      track({
        id: 'demo-character-completed',
        parameters: {
          character: currentCharacter.name,
        },
      })
    }
  }

  return (
    <motion.div
      className="container flex flex-col h-screen justify-between"
      variants={page}
      initial="hidden"
      animate="show"
      exit="exit"
    >
      <div className="mx-8 my-4">
        <NavBar />
      </div>
      {currentCharacter ? (
        <>
          <div className="flex flex-col lg:flex-row mb-auto">
            <div className="w-full lg:w-2/3 order-last lg:order-first">
              <UseCaseContainer
                issuedCredentials={issuedCredentials}
                completedUseCaseSlugs={completedUseCaseSlugs}
                useCases={useCases}
              />
              {isMobile && <div className="m-4">{dashboardCard}</div>}
            </div>
            <div className="flex flex-1 flex-col p-2 mx-2 dark:text-white">
              <ProfileCard currentCharacter={currentCharacter} />
              {!isMobile && dashboardCard}
            </div>
          </div>
        </>
      ) : (
        <AnimatePresence initial={false} exitBeforeEnter onExitComplete={() => null}>
          <Modal title={ERROR_TITLE} description={ERROR_DESCRIPTION} onOk={routeError} />
        </AnimatePresence>
      )}
      {demoCompleted && <DemoCompletedModal action={completeDemo} />}
      <Footer />
    </motion.div>
  )
}
