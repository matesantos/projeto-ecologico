import React from 'react'
import { Route, BrowserRouter, Redirect } from 'react-router-dom'

import Home from './pages/Home/index'
import CreatePoint from './pages/CreatePoint/index'

const Routes = () => {
    return (
        <BrowserRouter>
            <Route component={Home} path="/" exact/>
            <Route component={CreatePoint} path="/create-point"/>
            <Redirect from='*' to='/' />
        </BrowserRouter>
    )
}

export default Routes