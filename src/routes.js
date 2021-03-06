import React from 'react';
import {Route, IndexRoute, NoMatch} from 'react-router';
import {push} from 'react-router-redux';

import Login from './containers/Login.js';
import Settings from './containers/Settings.js';
import Dashboard from './containers/Dashboard.js';
import MasterWindow from './containers/MasterWindow.js';
import DocList from './containers/DocList.js';
import InboxAll from './containers/InboxAll.js';
import NavigationTree from './containers/NavigationTree.js';

import {
    logoutRequest,
    logoutSuccess,
    loginSuccess,
    localLoginRequest
} from './actions/AppActions';

import {
    createWindow
} from './actions/WindowActions';

export const getRoutes = (store, auth) => {
    const authRequired = (nextState, replace, callback) => {
        if( !localStorage.isLogged ){
            store.dispatch(localLoginRequest()).then((resp) => {
                if(resp.data){
                    store.dispatch(loginSuccess(auth));
                    callback(null, nextState.location.pathname);
                }else{
                    //redirect tells that there should be
                    //step back in history after login
                    store.dispatch(push('/login?redirect=true'));
                }
            })
        }else{
            store.dispatch(loginSuccess(auth));
            callback();
        }
    }

    const logout = () => {
        store.dispatch(logoutRequest()).then(()=>
            store.dispatch(logoutSuccess(auth))
        ).then(()=>
            store.dispatch(push('/login'))
        );
    }

    return (
        <Route path="/">
            <Route onEnter={authRequired}>
                <IndexRoute component={Dashboard} />
                <Route path="/window/:windowType"
                    component={(nextState) =>
                        <DocList
                            query={nextState.location.query}
                            windowType={nextState.params.windowType}
                        />
                    }
                />
                <Route path="/window/:windowType/:docId"
                    component={MasterWindow}
                    onEnter={(nextState) => store.dispatch(
                        createWindow(
                            nextState.params.windowType, nextState.params.docId
                        )
                    )}
                />
                <Route path="/sitemap" component={NavigationTree} />
                <Route path="/settings" component={Settings} />
                <Route path="/inbox" component={InboxAll} />
                <Route path="/logout" onEnter={logout} />
                <Route path="/dashboard1" component={Dashboard} />
                <Route path="/dashboard2" component={Dashboard} />
            </Route>
            <Route path="/login" component={nextState =>
                <Login
                    redirect={nextState.location.query.redirect}
                    logged={localStorage.isLogged}
                    {...{auth}}
                />
            } />
            <Route path="*" component={NoMatch} />
        </Route>
    )
}
