import { ActionType } from 'typesafe-actions'
import { getSchedule, makeRepresentSchedule, makePublicSchedule, undoRepresentSchedule, applyScheduleToMyPlan, getMainTerm,
  postMainSchedule, putMainSchedule, deleteMainSchedule, 
  getSubSchedule, postSubSchedule, putSubSchedule, deleteSubSchedule, getSubScheduleOnTarget, 
  postDaySchedule, putDaySchedule, deleteDaySchedule } from './actions'

const ScheduleActions = { 
  getSchedule, makeRepresentSchedule, makePublicSchedule, undoRepresentSchedule, applyScheduleToMyPlan, getMainTerm,
  postMainSchedule, putMainSchedule, deleteMainSchedule, 
  getSubSchedule, postSubSchedule, putSubSchedule, deleteSubSchedule, getSubScheduleOnTarget, 
  postDaySchedule, putDaySchedule, deleteDaySchedule 
}

export type ScheduleActions = ActionType<typeof ScheduleActions>

export interface MainSchedule {
  id: number
  userId: number
  title: string
  startDate: string  // date인데 test 할 때는 string
  endDate: string
  recommend: number
  view: number
  pb: boolean
  progress?: number
  tags: Array<string>
  represent: boolean
  category1: Array<string>  // large
  category2: Array<string>  // small
}

export type SubSchedule = {
  id: number
  calendarId: number
  subTitle: string
  color: string
  startDate: string  // date인데 test 할 때는 string
  endDate: string
}

export type DaySchedule = {
  calendarId: number,
  subTitleId: number,
  id: number,
  date: string,
  todo: string,
  goal: number,  // 시간 분 
  achieve: number,
}

export type SchedulesState = { 
  mainSchedules: MainSchedule[],
  subSchedules: SubSchedule[],
  daySchedules: DaySchedule[],
  myDaySchedules: DaySchedule[]
}
