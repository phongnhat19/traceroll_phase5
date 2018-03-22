import React from 'react';
import { Router, Route } from 'react-router';

import NotFound from './components/NotFound';
import Login from './components/Login';
import Home from './components/Home';
import Stage from './components/Stage';

const Routes = (props) => (
  <Router {...props}>
    <Route path="/" component={Home} />
    <Route path="/login" component={Login} />
    <Route path="/home" component={Home} />
    <Route path="/stage" component={Stage} />
    <Route path="/stage/:userslug/:elementId" component={Stage} />
    <Route path="/stage/:userslug" component={Stage} />
    <Route path="*" component={NotFound} />
  </Router>
);

export default Routes;
