export const gradeOptions = ['Khối 9', 'Khối 10', 'Khối 11', 'Khối 12'] as const

export type GradeOption = (typeof gradeOptions)[number]

const sections = ['A1', 'A2', 'A3', 'A4', 'A5']

export const classOptionsByGrade: Record<GradeOption, string[]> = {
  'Khối 9': sections.map((s) => `9${s}`),
  'Khối 10': sections.map((s) => `10${s}`),
  'Khối 11': sections.map((s) => `11${s}`),
  'Khối 12': sections.map((s) => `12${s}`),
}

export function classOptionsFor(grade: string): string[] {
  return classOptionsByGrade[grade as GradeOption] ?? []
}
