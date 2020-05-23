import React, { FunctionComponent, useMemo, useEffect } from 'react'
import Calendar from '../Calendar'
import { history } from '../../configureStore'
import useSchedule from '../../hooks/useSchedule'
import useUser from '../../hooks/useUser'
import usePlanPage from '../../hooks/usePlanPage'
import useWindowSize from '../../hooks/useWindowSize'

import axios from 'axios'
import path from 'path'
import dotenv from 'dotenv'

import './styles/MyPlan.scss'

dotenv.config({ path: path.join(__dirname, '.env') })
const SERVER_IP = process.env.REACT_APP_TEST_SERVER
const SERVER_IMG_IP = process.env.REACT_APP_TEST_SERVER_IMG


interface Interface {
  userName: string
}

const MyPlan: FunctionComponent<Interface> = (props: Interface) => {
  const {
    userName,
  } = props

  const { onGetUserInfo } = useUser()
  const { onGetTargetUser, onSetTargetUser } = usePlanPage()
  const { onPostMainSchedule, getMainSchedules, getSubSchedules, getDaySchedules } = useSchedule()
  const { width } = useWindowSize()
  const targetUser = onGetTargetUser
  const renderMainSchedule = onGetUserInfo ?
    (onGetUserInfo.id === targetUser.id ?
      getMainSchedules.filter(schedule => targetUser.id === schedule.userId)
      : getMainSchedules.filter(schedule => targetUser.id === schedule.userId).filter(schedule => schedule.pb === true))
    : getMainSchedules.filter(schedule => targetUser.id === schedule.userId).filter(schedule => schedule.pb === true)

  // console.log('mymain', renderMainSchedule)
  // console.log('main', getMainSchedules)
  // console.log('sub', getSubSchedules)
  // console.log('day', getDaySchedules)
  // console.log('getUserInfo', onGetUserInfo)
  // console.log('userId', userId)

  useEffect(() => {
    getUserId()
  }, [])

  // 유저 아이디 가져오기
  async function getUserId() {
    try {
      const response = await axios.get(SERVER_IP + '/user/name/' + userName)
      onSetTargetUser(response.data)
    }
    catch (e) {
      history.push('/error')
    }
  }

  const initialMainSchedule = {
    'id': 0,
    'userId': onGetUserInfo ? onGetUserInfo.id : 0,
    'title': '새 계획표',
    'startDate': '',
    'endDate': '',
    'pb': false,
    'tags': [''],
    'view': 0,
    'recommend': 0,
    'represent': false,
    'category1': onGetTargetUser ? onGetTargetUser.category1 : [''],
    'category2': onGetTargetUser ? onGetTargetUser.category2 : ['']
  }

  // 캘린더 추가 버튼 
  const handleAddCalendar = () => {
    onPostMainSchedule(initialMainSchedule)
  }

  // 화면에 렌더링할 컴포넌트 생성
  // widthSize: 'XL' >= 1200 > 'LG' >= 992 > 'MD' >= 768 > 'SM' >= 576 > 'XS'
  const userProfile = useMemo(() => {
    return onGetTargetUser &&
      <div className={width >= 576 ? 'headerOp' : 'headerOp-mobile'}>
        <img alt='profile' className='userImg' src={`${SERVER_IMG_IP}/${onGetTargetUser?.img}`} />
        <section className="profile">
          <section className="userInfo">
            <div className="userName">
              {onGetTargetUser.name}
            </div>
            <div className="userEmail">
              {onGetTargetUser.email}
            </div>
          </section>
          <section className="category">
            <div>
              {onGetTargetUser.category1.map((category, idx) => {
                return <div key={idx} className="userCategory1 third-color">{category}</div>
              })}
            </div>
            <div>
              {onGetTargetUser.category2.map((category, idx) => {
                return <div key={idx} className="userCategory2 fourth-color">{category}</div>
              })}
            </div>
          </section>
        </section>
      </div>
  }, [targetUser, width])

  const RepresentCalendar = useMemo(() =>
    renderMainSchedule && renderMainSchedule.map(schedule => {
      if (schedule.represent === true) {
        return (
          <Calendar
            key={schedule.id}
            calendarId={schedule.id}
            importId={0}
            calendarUserId={schedule.userId}
            defaultTitle={schedule.title}
            startMonth={schedule.startDate}
            subSchedule={getSubSchedules.filter(subItem => schedule.id === subItem.calendarId)}
            daySchedule={getDaySchedules.filter(dayItem => schedule.id === dayItem.calendarId)}
            represent={true}
            tags={schedule.tags}
            onPage='MyPlan'
          />

        )
      } else {
        return null
      }
    }
    ), [renderMainSchedule])

  const CalendarList = useMemo(() =>
    renderMainSchedule && renderMainSchedule.reverse().map(schedule => {
      if (schedule.represent !== true) {
        return (
          <Calendar
            key={schedule.id}
            calendarId={schedule.id}
            importId={0}
            calendarUserId={schedule.userId}
            defaultTitle={schedule.title}
            startMonth={schedule.startDate}
            subSchedule={getSubSchedules.filter(subItem => schedule.id === subItem.calendarId)}
            daySchedule={getDaySchedules.filter(dayItem => schedule.id === dayItem.calendarId)}
            represent={false}
            tags={schedule.tags}
            onPage='MyPlan'
          />
        )
      } else {
        return null
      }
    }
    ), [renderMainSchedule])


  return (
    <div>
      {userProfile}
      <hr />
      <div className={`RepresentCalendar`}>
        {RepresentCalendar}
      </div>

      <div className={`CalendarList`}>
        {CalendarList}
      </div>

      {(onGetUserInfo && onGetUserInfo.id === onGetTargetUser.id) &&
        <div className="req-calendar-wrap" onClick={handleAddCalendar}>
          <div className="req-calendar-text">
            시간표를 추가해주세요.
          </div>
        </div>}
    </div>
  )
}

export default MyPlan