import type { Character } from '../types'

import { v4 as uuid } from 'uuid'

export const Student: Character = {
  id: '1',
  image: '/public/student/student.svg',
  name: 'Jan',
  type: 'Student',
  backstory:
    'Jan is feeling great! He just got into law school and is ready to experience everything that student life has to offer. Help him navigate the experience!',
  starterCredentials: [
    {
      id: uuid(),
      name: 'Animo ID Card',
      icon: '/public/student/icon-student.svg',
      attributes: [
        { name: 'Name', value: 'Jan Rietveld' },
        { name: 'Date of birth', value: '19990101' },
        { name: 'Street', value: 'Neerpolderseweg 47' },
        { name: 'City', value: 'Giessenburg' },
        { name: 'Nationality', value: 'The Netherlands' },
      ],
    },
  ],
}
