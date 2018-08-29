import React from 'react';
import { Router, Route } from 'react-router';
import Login from './components/Login';
import NotFound from './components/NotFound';
import Consent from './components/Consent';
import SignUp from './components/SignUp';
import Home from './components/Home';
import Stage from './components/Stage';
import About from './components/About';
import ResetPwd from './components/ResetPwd';
import NonRegistration from './components/NonRegistration';
import Terms from './components/About';
import PrivacyPolicy from './components/About';

const Routes = (props) => (
  <Router {...props}>
    <Route path="/" component={Home} />
    <Route path="/consent" component={Consent} />
    <Route path="/intro" component={SignUp} />
    <Route path="/login" component={Login} />
    <Route path="/home" component={Home} />
    <Route path="/about" component={About} />
    <Route path="/terms" component={Terms} />
    <Route path="/privacy-policy" component={PrivacyPolicy} />
    <Route path="/stage" component={Stage} />
    <Route path="/stage/:userslug/:elementId" component={Stage} />
    <Route path="/stage/:userslug" component={Stage} />
    <Route path="/reset/password/:token" component={ResetPwd} />
    <Route path="/user/non-regis/:tokenNonRegis" component={NonRegistration} />
    <Route path="*" component={NotFound} />
  </Router>
);

export default Routes;
