import React, { FunctionComponent } from 'react'
import { getToken } from '../User/authentication'
import useWindowSize from '../../hooks/useWindowSize'
import LoginForm from '../User/LoginForm'

import './styles/StatuInfo.scss'

import mainLogo from '../../img/메인로고.png'
import mobileMainLogo from '../../img/모바일메인로고.png'

const StatuInfoForm: FunctionComponent = () => {

    const token = getToken()
    const { width } = useWindowSize()
    
    return (
        <div className={'main-color ' + (width>=992 ? 'statuInfoTemplate' : (width >= 768 ? 'statuInfoTemplate-mobile-md' : 'statuInfoTemplate-mobile-sm'))}>
            <div className={(width >= 768 ? 'projectInfoBox' : 'projectInfoBox-mobile')}>
                <img className='main-logo' src={(width >= 1024 ? mainLogo : mobileMainLogo)} alt="mainLogo"/>
                <h5>쉽고 간편하게 공부 계획을 세우고 다른 사람들과 공유해서 함께 공부해요. Study Together, STATU!</h5>
            </div>

            { !token && 
            <div 
                className='loginBox'
                style={{'width': `${width >= 768 ? 50 : 100}vw`}}
            >
                <LoginForm />
            </div>
            }
        </div>
    )
}

export default StatuInfoForm