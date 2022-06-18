import type { CharWithUseCases } from '../types'

import { Student } from './Student'
import { Club } from './useCases/Club'
import { Graduate } from './useCases/Graduate'
import { School } from './useCases/School'
import { Sport } from './useCases/Sport'

export const StudentUseCases: CharWithUseCases = {
  characterId: Student.id,
  useCases: [Graduate, School, Club, Sport],
}
