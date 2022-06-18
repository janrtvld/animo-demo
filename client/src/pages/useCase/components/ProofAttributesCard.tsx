import type { Attribute, Entity, RequestedCredential } from '../../../slices/types'
import type { ProofRecord } from '@aries-framework/core'

import React, { useEffect, useState } from 'react'

import { CheckMark } from '../../../components/Checkmark'
import { Loader } from '../../../components/Loader'
import { getAttributesFromProof } from '../../../utils/ProofUtils'
import { prependApiUrl } from '../../../utils/Url'

export interface Props {
  entity: Entity
  requestedCredentials: RequestedCredential[]
  values: Value
  proofReceived: boolean
}

export interface Value {
  [key: string]: string
}

export const ProofAttributesCard: React.FC<Props> = ({ entity, requestedCredentials, values, proofReceived }) => {
  const [values1, setValues1] = useState<Attribute[]>([])

  // const formatDate = (prop: string) => {
  //   const year = prop.substring(0, 4)
  //   const month = prop.substring(4, 6)
  //   const day = prop.substring(6, 8)
  //   return `${year}-${month}-${day}`
  // }

  // useEffect(() => {
  //   if (proofReceived) {
  //     const attr = getAttributesFromProof(proof)
  //     setValues(attr)
  //   }
  // }, [proofReceived])

  useEffect(() => {
    for (const key in values) {
      const attribute = { name: key, value: values[key] }
      setValues1([...values1, attribute])
    }
  }, [values])

  const renderRequestedCreds = requestedCredentials.map((item) => {
    return (
      <div className="block md:flex lg:block flex-1 lg:flex-col items-center justify-between pt-4" key={item.id}>
        <div className="flex flex-1 flex-row">
          <div className="bg-animo-lightgrey dark:bg-animo-darkgrey rounded-lg p-2 w-12">
            <img className="h-8 m-auto" src={prependApiUrl(item.icon)} alt="icon" />
          </div>
          <div className="flex flex-1 flex-row justify-between px-4 dark:text-white m-auto">
            <p className="font-semibold self-center">{item.name}</p>
          </div>
        </div>
        <div className="flex flex-1 flex-col md:pl-16">
          {values1.length > 0 ? (
            values1.map((prop: Attribute) => {
              return (
                <div key={prop.name} className="flex flex-row">
                  <p className="flex-1-1 text-sm bg-animo-lightgrey dark:bg-animo-darkgrey p-1 px-2 rounded-lg my-1 md:m-2">
                    {prop.name.charAt(0).toUpperCase() + prop.name.slice(1)}
                  </p>
                  <p className="flex-1 text-sm bg-white dark:bg-grey p-1 px-2 rounded-lg m-2 truncate">{prop.value}</p>
                </div>
              )
            })
          ) : (
            <div key={'name'} className="flex flex-row">
              <p className="flex-1-1 text-sm bg-animo-lightgrey dark:bg-animo-darkgrey p-1 px-2 rounded-lg my-1 md:m-2">
                Name
              </p>
              <p className="flex-1 text-sm bg-white dark:bg-grey p-1 px-2 rounded-lg m-2 truncate"></p>
            </div>
          )}
        </div>
      </div>
    )
  })

  return (
    <div className="flex flex-col bg-animo-white dark:bg-animo-black p-4 md:mb-8 rounded-lg shadow max-h-64 my-2 sm:max-h-72 md:max-h-96 overflow-auto">
      <div className="flex-1-1 title">
        <div className="flex flex-row">
          <h1 className="flex flex-1 font-semibold dark:text-white">{entity.name} would like to know:</h1>
          <div className="flex-1-1 h-8 mb-2">{proofReceived ? <CheckMark /> : <Loader />}</div>
        </div>
        <hr className="text-animo-lightgrey" />
      </div>
      <div className="flex flex-col">{renderRequestedCreds}</div>
    </div>
  )
}
