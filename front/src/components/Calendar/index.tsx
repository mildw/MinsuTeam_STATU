import React, { useState, FunctionComponent, ChangeEvent, MouseEvent, useCallback, KeyboardEvent } from 'react';
import Modal from '../Modal/Modal'
import useModal from '../../hooks/useModal'
import useDrag from '../../hooks/useDrag'
import useUser from '../../hooks/useUser'
import useSchedule from '../../hooks/useSchedule'
import useImportedSchedule from '../../hooks/useImportedSchedule'
import MonthViewCalendar from './MonthView/MonthViewCalendar'
import CalendarNavi from './CalendarNavi/CalendarNavi'
import { SubSchedule, DaySchedule } from '../../store/schedule'

import dayjs from 'dayjs'
import localeDe from "dayjs/locale/ko"

import pencil from '../../img/pencil.png'
import trash from '../../img/trash-can.png'
import lock from '../../img/lock.png'
import check_icon from '../../img/check.png'
import share3 from '../../img/share3.png'
import star4 from '../../img/star4.png'
import star5 from '../../img/star5.png'
import close_ppt from '../../img/close_ppt.png'
import smart_cart from '../../img/smart-cart.png'
import import_icon from '../../img/import-icon.png'
import plus from '../../img/addHashTag.png'
import arrow_right from '../../img/arrow_right.png'

import './styles/Calendar.scss'
import { history } from '../../configureStore';

interface Interface {
  calendarId: number
  importId: number
  calendarUserId: number
  defaultTitle: string
  startMonth: string
  subSchedule: SubSchedule[]
  daySchedule: DaySchedule[]
  represent: boolean
  tags: string[]
  onPage: string
}


const Calendar: FunctionComponent<Interface> = (props: Interface) => {
  const {
    calendarId,
    importId,
    calendarUserId,
    defaultTitle,
    startMonth,
    subSchedule,
    daySchedule,
    represent,
    tags,
    onPage,
  } = props

  // console.log(calendarId, onPage, 'Calendar View')
  const { onGetUserInfo } = useUser()
  const { startDate, tempDate } = useDrag()
  const { onPostImportedSchedule, onDeleteImportedSchedule } = useImportedSchedule() 

  const targetDate: dayjs.Dayjs = onPage === 'MyPlan' ? dayjs().locale(localeDe) : (startMonth !== '' ? dayjs(startMonth) : dayjs().locale(localeDe))
  const [targetDateString, setTargetDateString] = useState<string>(targetDate.format('YYYY-MM-DD'))
  const [targetMonth, setTargetMonth] = useState<string>(targetDate.format('YYYY-MM-DD'))
  const [title, setTitle] = useState<string>(defaultTitle)
  const [hashTagName, setHashTagName] = useState<string>('')
  const [showMonth, setShowMonth] = useState<boolean>(represent)
  const [editMode, setEditMode] = useState<boolean>(false)

  const { modalState } = useModal()

  // 마우스 호버 변수
  const [hoverState, setHoverState] = useState<boolean>(false)
  const [hoverItemId, setHoverItemId] = useState<number>(0)

  // 이번달 시작날짜, 끝날짜 계산
  const daysInMonth = dayjs(targetMonth).daysInMonth()
  const startDayInMonth = dayjs(targetMonth).date(1)
  const endDayInMonth = dayjs(targetMonth).date(daysInMonth)

  const targetMonthStartDay = startDayInMonth.day() + 1
  const targetMonthEndDay = endDayInMonth.day() + 1

  // 시작날짜, 끝날짜를 이용해 이번 달에 렌더링할 캘린더 데이터 필터링
  const startDay = startDayInMonth.add(-(targetMonthStartDay - 1), 'day')
  const endDay = endDayInMonth.add((7 - targetMonthEndDay), 'day')

  // 일일 스케줄 데이터 필터링
  const daySchedules = daySchedule.filter(schedule => dayjs(schedule.date) >= startDay && dayjs(schedule.date) <= endDay)

  // 소목표 데이터 필터링
  const subSchedules = subSchedule
    .filter(schedule => !(dayjs(schedule.endDate) < startDay || dayjs(schedule.startDate) > endDay) 
      || schedule.startDate === '9999-99-99')  // 이번 달에 있는 일정
    .sort(function (a, b) {
      if (sortDate(a.startDate, b.startDate) === 0) {
        return sortDate(b.endDate, a.endDate)
      } else {
        return sortDate(a.startDate, b.startDate)
      }
    })

  // 해시태그 리스트
  const hashTagList = tags.filter(tag => tag !== '')

  // 사용함수
  const { getMainSchedules, onApplyScheduletoMyPlan,
    onPutMainSchedule, onDeleteMainSchedule, onMakeRepresentSchedule, onUndoRepresentSchedule, onMakePublicSchedule } = useSchedule()
  const initialMainCalendar = getMainSchedules.filter(schedule => schedule.id === calendarId)[0]

  function sortDate(first: string, second: string) {
    const [firstYear, firstMonth, firstDay] = first.split('-').map(string => parseInt(string))
    const [secondYear, secondMonth, secondDay] = second.split('-').map(string => parseInt(string))

    if (firstYear < secondYear) {
      return -1
    } else if (firstYear > secondYear) {
      return 1
    } else {
      if (firstMonth < secondMonth) {
        return -1
      } else if (firstMonth > secondMonth) {
        return 1
      } else {
        if (firstDay < secondDay) {
          return -1
        } else if (firstDay > secondDay) {
          return 1
        } else {
          return 0
        }
      }
    }
  }

  const handleState = (targetDateString: string) => {
    setTargetDateString(targetDateString)
  }

  const handleMovePrevMonth = (e: MouseEvent, now: string) => {
    e.stopPropagation()
    const prevMonth = dayjs(now).add(-1, 'month').format('YYYY-MM-DD')
    setTargetMonth(prevMonth)
  }

  const handleMoveNextMonth = (e: MouseEvent, now: string) => {
    e.stopPropagation()
    const nextMonth = dayjs(now).add(1, 'month').format('YYYY-MM-DD')
    setTargetMonth(nextMonth)
  }

  const handleShowMonth = () => {
    if (represent !== true) {
      setShowMonth(!showMonth)
    }
  }

  // 캘린더 헤더 쪽에 있는 버튼 함수
  const handleMouseEnter = (id: number) => {
    setHoverState(true)
    setHoverItemId(id)
    // console.log('mouseEnter', hoverState, hoverItemId)
  }

  const handleMouseLeave = () => {
    setHoverState(false)
    setHoverItemId(0)
    // console.log('mouseLeave', hoverState, hoverItemId)
  }

  const handleInputClick = (e: MouseEvent) => {
    e.stopPropagation()
  }

  const handleEditMode = (e: MouseEvent) => {
    e.stopPropagation()
    setEditMode(true)
  }

  const handleTitle = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
  }

  const handleTitleClick = (e: MouseEvent) => {
    e.stopPropagation()
    const editedSchedule = { ...initialMainCalendar, title: title }
    // console.log('edit', editedSchedule)
    onPutMainSchedule(editedSchedule)
    setEditMode(false)
  }

  const handleTitleEnter = (e: KeyboardEvent) => {
    // console.log('title')
    e.stopPropagation()
    if (e.key !== 'Enter') return
    const editedSchedule = { ...initialMainCalendar, title: title }
    onPutMainSchedule(editedSchedule)
    setEditMode(false)
  }

  const handleHashTag = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setHashTagName(e.target.value)
  }, [])

  const handleAddHashtag = async (e: MouseEvent) => {
    e.stopPropagation()
    hashTagList.push(hashTagName)
    const editedSchedule = { ...initialMainCalendar, tags: hashTagList }
    onPutMainSchedule(editedSchedule)
    setHashTagName('')
  }

  const handleHashTagEnter = (e: KeyboardEvent) => {
    e.stopPropagation()
    if (e.key !== 'Enter') return
    hashTagList.push(hashTagName)
    const editedSchedule = { ...initialMainCalendar, tags: hashTagList }
    onPutMainSchedule(editedSchedule)
    setHashTagName('')
  }

  const handleDeleteHashtag = (e: MouseEvent, id: number) => {
    e.stopPropagation()
    hashTagList.splice(id, 1)
    const editedSchedule = { ...initialMainCalendar, tags: hashTagList }
    onPutMainSchedule(editedSchedule)
  }

  const handleDeleteCalendar = (e: MouseEvent) => {
    e.stopPropagation()
    onDeleteMainSchedule(calendarId)
  }

  const handleDeleteImportedCalendar = (e: MouseEvent) => {
    onDeleteImportedSchedule(importId)
    e.stopPropagation()
  }

  const handleMakeRepresent = (e: MouseEvent) => {
    e.stopPropagation()
    onMakeRepresentSchedule(calendarId)
  }

  const handleUndoRepresent = (e: MouseEvent) => {
    e.stopPropagation()
    onUndoRepresentSchedule(calendarId)
  }

  const handlePublicToggle = (e: MouseEvent) => {
    e.stopPropagation()
    onMakePublicSchedule(calendarId)
  }

  const handleScrap = (e: MouseEvent) => {
    e.stopPropagation()
    if (!onGetUserInfo) return

    const editedSchedule = { ...initialMainCalendar, recommend: initialMainCalendar.recommend + 1 }
    onPutMainSchedule(editedSchedule)

    const scrapInfo = {
      "calendarId": calendarId,
      "id": 0,
      "userId": onGetUserInfo.id
    }
    onPostImportedSchedule(scrapInfo)
    alert("가져온 공부에 계획표가 추가되었습니다!!")
  }

  const handleGoDetail = (e: MouseEvent) => {
    e.stopPropagation()
    history.push(`/detail/${calendarId}`)
  }

  const handleSave = async (e: MouseEvent) => {
    if (!onGetUserInfo) return
    e.stopPropagation()

    let editedSchedule = { ...initialMainCalendar, userId: onGetUserInfo.id, represent: false, pb: false }
    onApplyScheduletoMyPlan(editedSchedule)
    alert("계획표 추가 완료!!")
  }


  // TODO : 커스텀 hook으로 변경할 것
  // store.getState().drag.tempDate 로 tempDate가져오면 느림!(계속 변하기 때문인듯)
  const getSelectedDate = tempDate
  const dragStart = dateToNumber(startDate) // startDate는 변하지 않음
  const dragOver = dateToNumber(getSelectedDate)
  // 소목표를 앞으로 설정하는지 뒤로 설정하는지에 대한 조건 - CalendarDay 컴포넌트까지 내려보냄
  const isAscending: boolean = dragOver - dragStart + 1 > 0 ? true : false

  function dateToNumber(strDate: string): number {
    var result = strDate.replace(/\-/g, '')
    return parseInt(result)
  }

  // 사용자와 상호작용을 보여주기 위한 변수
  const canEdit = onGetUserInfo !== null ? (onGetUserInfo.id === calendarUserId && onPage === 'MyPlan' ? '' : 'pointerNone') : 'pointerNone'
  const openCalendar = represent || showMonth ? 'openCalendar' : 'closeCalendar'

  return (
    <div
      // 모달을 제외한 화면을 클릭했을 때 모달이 종료되도록 조정 필요
      className={ onPage !== 'Overview' ? `calendarContainer ${openCalendar} ` : 'calendarContainer-overview'}>
      {/* 달력 헤더 */}
      <div
        className={onPage !== 'Overview' ? "headerContainer" : 'headerContainer-overview'}
        onClick={handleShowMonth}
      >
        <div className={onPage !== 'Overview' ? "calendarHeader" : "calendarHeader-overview"}>
          <div className={`calendarTitle ${canEdit}`}>
            {!editMode ?
              <div className={ onPage != 'Overview' ? "showtitle" : 'showtitle-overview'}>
                {title}
              </div>
              :
              // 캘린더제목 수정모드일 때
              <input
                className="editTitle"
                type="text"
                value={title}
                onChange={handleTitle}
                onKeyPress={handleTitleEnter}
              />
            }
            {!canEdit ?
              <div
                className={`calendarHeaderButton`}
                onClick={handleEditMode}
              >
                {/* 수정 icon */}
                {!editMode ?
                  <div className="calendarHeaderButton">
                    <img src={pencil} alt="수정icon" style={{ width: "15px" }} />
                  </div>
                  :
                  <div
                    className={`calendarHeaderButton`}
                    onClick={handleTitleClick}
                  >
                    <img src={check_icon} alt="확인" style={{ width: "15px" }} />
                  </div>
                }
              </div>
              :
              ''
            }
          </div>
          {!canEdit ?
            <div
              className={`calendarOption`}
            >
              <div
                className={`alignRight`}
              >
                {/* 대표 icon */}
                  {initialMainCalendar.represent ?
                    <div
                      className={`calendarHeaderButton`}
                      onClick={handleUndoRepresent}
                    >
                      <img src={star4} alt="star4" style={{ width: "15px" }} />
                    </div>
                    :
                    <div
                      className={`calendarHeaderButton`}
                      onClick={handleMakeRepresent}
                    >
                      <img src={star5} alt="no-star" style={{ width: "15px" }} />
                    </div>
                  }
                
                {/* 공유 & lock icon */}
                <div
                  className={`calendarHeaderButton`}
                  onClick={handlePublicToggle}
                >
                  {initialMainCalendar.pb ?
                    <img src={share3} alt="share3" style={{ width: "15px" }} />
                    :
                    <img src={lock} alt="lock" style={{ width: "15px" }} />
                  }
                </div>
                {/* 삭제 icon */}
                <div
                  className={`calendarHeaderButton`}
                  onClick={handleDeleteCalendar}
                >
                  <img src={trash} alt="쓰레기통" style={{ width: "15px" }} />
                </div>
              </div>
            </div>
            :
            <div
              className={`calendarOption`}
            >
              <div className={`alignRight`}>
                {onPage !== 'ImportedPlan' ?

                  onPage === 'Overview' ?
                    <div>
                      <div className={`calendarHeaderButton`} >
                        <img src={smart_cart} onClick={handleScrap} alt="장바구니" style={{ width: "15px", margin: '0 3px' }} />
                        <img src={arrow_right} onClick={handleGoDetail} alt="상세페이지" style={{ width: "15px", margin: '0 3px' }} />
                      </div>
                    </div>
                  :
                  <div
                    className={`calendarHeaderButton`}
                    onClick={handleScrap}
                  >
                    <img src={smart_cart} alt="장바구니" style={{ width: "15px" }} />
                  </div>
                :
                  <div
                    className={`calendarHeaderButton`}
                    onClick={handleSave}
                  >
                    <img src={import_icon} alt="저장하기" style={{ width: "15px" }} />
                  </div>
                }
                {importId !== 0 ?
                  <div
                    className={`calendarHeaderButton`}
                    onClick={handleDeleteImportedCalendar}
                  >
                    <img src={trash} alt="쓰레기통" style={{ width: "15px" }} />
                  </div>
                  :
                  ''
                }
                  </div>
                </div>
              }
            </div>
              <div className={`hashTagList ${canEdit}`}>
                {onPage === 'MyPlan' && (onGetUserInfo?.id === calendarUserId && showMonth) ?
                  <div
                    className={`hashTagInput`}
                    onClick={handleInputClick}
                  >
                    <input
                      className="inputTag"
                      type="text"
                      placeholder=" 태그입력"
                      value={hashTagName}
                      onChange={handleHashTag}
                      maxLength={10}
                      onKeyPress={handleHashTagEnter}
                    />
                    <div
                      className={`calendarHeaderButton`}
                      onClick={handleAddHashtag}
                    >
                      <img src={plus} alt="추가" style={{ width: "15px" }} />
                    </div>
                  </div>
                :
                ''
                }
              {/* {hashTagComponents} */}
              {
                hashTagList.map((hashTag, idx) =>
                  <div
                    key={idx}
                    className={'sub-color ' + (onPage === 'Overview' ? 'hashTagItem-overview' : 'hashTagItem')}
                    onMouseEnter={() => handleMouseEnter(idx)}
                    onMouseLeave={() => handleMouseLeave()}
                  >
                    {/* {onPage === 'Overview' ?
                      (hashTag.length > 4 ? hashTag.slice(0,4)+'..' : hashTag)
                    :
                      hashTag
                    } */}
                    {hashTag}
                    {hoverState && idx === hoverItemId ?
                      <div
                        className={`calendarHeaderButton`}
                        onClick={(e) => handleDeleteHashtag(e, idx)}
                      >
                        <img src={close_ppt} alt="close_ppt" style={{ width: "15px" }} />
                      </div>
                      :
                      ''
                    }
                  </div>)
                }
            </div>
        </div>
      <div
        className={`calendarBody ${canEdit}`}
      >
        {showMonth ?
          <>
            {/* 달력 저번달 다음달 전환 버튼 */}
            <CalendarNavi targetMonth={targetMonth} onMovePrevMonth={handleMovePrevMonth} onMoveNextMonth={handleMoveNextMonth} onPage={onPage} />
            {/* showMonth 타입에 따른 렌더링 될 달력 선택 */}
            <MonthViewCalendar
              calendarId={calendarId}
              targetMonth={targetMonth}
              targetDateString={targetDateString}
              mainSchedule={initialMainCalendar}
              subSchedule={subSchedules}
              daySchedule={daySchedules}
              handleState={handleState}
              colorActiveDate="palegoldenrod"
              colorPastDates="#F1F1F1"
              isAscending={isAscending}
              onPage={onPage}
            />
            {/* 모달 */}
            {modalState ?
              <Modal />
              :
              ''
            }
          </>
          :
          ''
        }
      </div>
    </div>
  )
}
export default Calendar