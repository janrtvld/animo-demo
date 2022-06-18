import type { UseCase } from '../../types'

import { v4 as uuid } from 'uuid'

import { StepType } from '../../types'

const URL = '/public/student/useCases/graduate'

export const Graduate: UseCase = {
  slug: 'graduate',
  card: {
    title: 'Graduate from the HU',
    image: `${URL}/card-graduate.svg`,
    description: `After years of hard work it is finally time graduate. Accept your diploma the right way!`,
  },
  stepper: [
    {
      id: uuid(),
      name: `Connect with the HU`,
      description: `Setup a secure connection with the university.`,
      steps: 1,
      section: 1,
    },
    {
      id: uuid(),
      name: 'Share your personal information',
      description: 'Use the connection to submit your information.',
      steps: 2,
      section: 1,
    },
    {
      id: uuid(),
      name: 'Receive your diploma',
      description: 'Accept your new diploma that is issued by the University.',
      steps: 3,
      section: 1,
    },
  ],

  sections: [
    {
      id: uuid(),
      entity: {
        name: 'HU University',
        icon: `${URL}/logo-university.png`,
        imageUrl: 'https://i.imgur.com/KNsv3Qd.png',
      },
      colors: {
        primary: '#92E3A9',
        secondary: '#c0f9d0',
      },
      requestedCredentials: [
        {
          id: uuid(),
          name: 'JAnimo ID Card',
          icon: '/public/student/icon-student.svg',
          properties: ['Name', 'Date of birth'],
        },
      ],
      issueCredentials: [
        {
          id: uuid(),
          name: 'University Diploma',
          properties: [{ name: 'Name' }, { name: 'Date of birth' }],
          attributes: [
            { name: 'University', value: 'University of Law' },
            { name: 'Faculty', value: 'Law' },
            { name: 'StudentID', value: '121098' },
            { name: 'Valid until', value: '20230831' },
          ],
          icon: `${URL}/icon-degree.svg`,
        },
      ],
      steps: [
        {
          id: uuid(),
          type: StepType.INFO,
          title: 'They do things a little different at the HU.',
          description: `As innovative as they are, your not getting a diploma on paper but directly on your phone. Safe and secure.`,
          image: `${URL}/show-phone.svg`,
        },
        {
          id: uuid(),
          type: StepType.CONNECTION,
          title: 'Scan the QR-code to connect with the HU.',
          description: `Scan the QR-Code to set up a secure connection with the university. The university connection will appear in your wallet!`,
        },
        {
          id: uuid(),
          type: StepType.PROOF,
          title: 'The HU wants some information.',
          description: `Grab your wallet, you've received a request for some information! To finish the graduation process, share the information by accepting the request. `,
          requestOptions: {
            name: 'HU Request',
            comment: 'The university would like some of your personal information.',
          },
        },
        {
          id: uuid(),
          type: StepType.CREDENTIAL,
          title: `The university issues you your diploma.`,
          description: `Open your wallet, and accept your new diploma. You can use this pass to access the university's facilities and obtain some great student discounts.`,
          requestOptions: {
            name: 'Diploma',
            comment: 'Here is your diploma.',
          },
          useProof: true,
        },
        {
          id: uuid(),
          type: StepType.END,
          title: 'Congratulations, you did it!',
          description: 'Great job on finishing this use case. These are the steps you took.',
          endStepper: [
            {
              id: uuid(),
              title: `You connected with the university`,
              description: 'This secure channel can be used for all of your communication with the university.',
              image: `${URL}/card-graduate.svg`,
            },
            {
              id: uuid(),
              title: 'You safely presented your data',
              description: `Without showing all of your data, you successfully applied by accepting the university's request.`,
              image: `${URL}/show-phone.svg`,
            },
            {
              id: uuid(),
              title: 'You got in!',
              description: `Your application was accepted and the university issued you your diploma. This pass is now safely stored in your digital wallet.`,
              image: `${URL}/school-yes.svg`,
            },
          ],
        },
      ],
    },
  ],
}
