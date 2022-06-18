import type { Attribute, CredentialData, Step } from '../../../slices/types'
import type { ProofRecord } from '@aries-framework/core'
import type { CredReqMetadata } from 'indy-sdk'

import { JsonTransformer, CredentialRecord } from '@aries-framework/core'
import { AnimatePresence, motion } from 'framer-motion'
import { track } from 'insights-js'
import React, { useEffect, useState } from 'react'

import { fade, fadeX } from '../../../FramerAnimations'
import { ActionCTA } from '../../../components/ActionCTA'
import { Loader } from '../../../components/Loader'
import { useAppDispatch } from '../../../hooks/hooks'
import { useInterval } from '../../../hooks/useInterval'
import { useCurrentCharacter } from '../../../slices/characters/charactersSelectors'
import {
  deleteCredentialById,
  fetchCredentialsByConId,
  issueCredential,
} from '../../../slices/credentials/credentialsThunks'
import { useUseCaseState } from '../../../slices/useCases/useCasesSelectors'
import { useWorkflowExecution, useWorkflowExecutionId } from '../../../slices/workflows/workflowExecutionSelectors'
import { fetchWorkflowExecutionById } from '../../../slices/workflows/workflowExecutionThunks'
import { getAttributesFromProof } from '../../../utils/ProofUtils'
import { Credential } from '../../onboarding/components/Credential'
import { FailedRequestModal } from '../../onboarding/components/FailedRequestModal'
import { StarterCredentials } from '../../onboarding/components/StarterCredentials'
import { StepInfo } from '../components/StepInfo'

export interface Props {
  step: Step
  connectionId: string
  issueCredentials: CredentialData[]
  credentials: CredentialRecord[]
  proof: ProofRecord | undefined
}

export const StepCredential: React.FC<Props> = ({ step, connectionId, issueCredentials, credentials, proof }) => {
  const dispatch = useAppDispatch()

  const [isFailedRequestModalOpen, setIsFailedRequestModalOpen] = useState(false)
  const showFailedRequestModal = () => setIsFailedRequestModalOpen(true)
  const closeFailedRequestModal = () => setIsFailedRequestModalOpen(false)

  // const credentialsAccepted = Object.values(credentials).every(
  //   (x) => x.state === 'credential-issued' || x.state === 'done'
  // )
  const uc = useUseCaseState()
  const char = useCurrentCharacter()
  const workflowExecutionId = useWorkflowExecutionId()
  const workflowExecution = useWorkflowExecution()
  const credentialsAccepted = workflowExecution.status === 'Completed'
  const actionResult =
    workflowExecution.status === 'WaitingForTrigger' &&
    (workflowExecution.payload.actions.issueCredential as {
      output: {
        connectionId: string
        invitationUrl: string
      }
    })
  const [issuedCredData, setIssuedCredData] = useState<CredentialData[]>([])

  const issueCreds = () => {
    // get attributes from proof
    let attributes: Attribute[] = []
    if (step.useProof && proof) {
      attributes = getAttributesFromProof(proof)
    }

    // create new object with attributes
    const credentialData = issueCredentials.map((credential: CredentialData) => ({
      ...credential,
      attributes: credential.attributes ? attributes.concat(credential.attributes) : attributes,
    }))

    // save data for when issue fails
    setIssuedCredData(credentialData)

    // issue credentials
    credentialData.forEach((item) => {
      dispatch(issueCredential({ connectionId: connectionId, cred: item }))
      track({
        id: 'credential-issued',
      })
    })
  }

  useEffect(() => {
    if (credentials.length === 0) issueCreds()
  }, [])

  useInterval(
    () => {
      if (workflowExecutionId && document.visibilityState === 'visible') {
        dispatch(fetchWorkflowExecutionById(workflowExecutionId))
      }
    },
    !credentialsAccepted ? 1000 : null
  )

  // const sendNewCredentials = () => {
  //   credentials.forEach((cred) => {
  //     if (cred.state !== 'credential-issued' && cred.state !== 'done') {
  //       dispatch(deleteCredentialById(cred.id))

  //       const newCredential = issuedCredData.find((item) => {
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

  const renderCredentials = credentials
    .slice()
    .map((cred, idx) => {
      const data = issueCredentials.find((item) => {
        const credClass = JsonTransformer.fromJSON(cred, CredentialRecord)
        return (
          item.credentialDefinitionId ===
          credClass.metadata.get<CredReqMetadata>('_internal/indyCredential')?.credentialDefinitionId
        )
      })
      if (data) return <Credential key={cred.id} title={`Credential ${idx + 1}`} credential={cred} data={data} />
    })
    .sort((a, b) => a?.props.data.id.localeCompare(b?.props.data.id))

  return (
    <motion.div variants={fadeX} initial="hidden" animate="show" exit="exit" className="flex flex-col h-full">
      <StepInfo title={step.title} description={step.description} />
      <div className="flex flex-1-1 m-auto">
        <motion.div className={`flex flex-1-1 flex-col m-auto`} variants={fade} animate="show" exit="exit">
          {credentials.length <= (issueCredentials?.length ?? 0) ? (
            <AnimatePresence exitBeforeEnter>
              {uc.currentUseCase?.sections[0].issueCredentials && (
                <StarterCredentials
                  credentialData={uc.currentUseCase?.sections[0].issueCredentials}
                  credentials={credentials}
                  completed={credentialsAccepted}
                  name={'Credentials'}
                />
              )}
            </AnimatePresence>
          ) : (
            <motion.div className="flex flex-col h-full m-auto">
              <Loader />
            </motion.div>
          )}
        </motion.div>
      </div>
      <ActionCTA isCompleted={credentialsAccepted} onFail={showFailedRequestModal} />
      {/* {isFailedRequestModalOpen && (
        <FailedRequestModal key="credentialModal" action={sendNewCredentials} close={closeFailedRequestModal} />
      )} */}
    </motion.div>
  )
}
