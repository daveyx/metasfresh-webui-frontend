import * as types from '../constants/ActionTypes';
import update from 'immutability-helper';

const initialState = {
	notifications: {},
    isLogged: false,
    processStatus: 'saved',
    inbox: {
        notifications: [],
        unreadCount: 0
    }
}

export default function appHandler(state = initialState, action) {
    switch(action.type){
        case types.LOGIN_SUCCESS:
            return Object.assign({}, state, {
                isLogged: true
            })

        case types.LOGOUT_SUCCESS:
            return Object.assign({}, state, {
                isLogged: false
            })

        // NOTIFICATION ACTIONS
        case types.ADD_NOTIFICATION:
            return Object.assign({}, state, {
                notifications: Object.assign({}, state.notifications, {
                    [action.title]: {
                        title: action.title,
                        msg: action.msg,
                        shortMsg: action.shortMsg,
                        time: action.time,
                        notifType: action.notifType,
                        count: state.notifications[action.title] ?
                            state.notifications[action.title].count + 1 : 0
                    }
                })
            });

        case types.DELETE_NOTIFICATION:
            return Object.assign({}, state, {
                notifications: Object.keys(state.notifications)
                    .reduce((res, key) => {
                        if(key !== action.key) {
                            res[key] = state.notifications[key];
                        }
                        return res;
                }, {})
            });

        // END OF NOTIFICATION ACTIONS
        case types.GET_NOTIFICATIONS_SUCCESS:
            return Object.assign({}, state, {
                inbox: Object.assign({}, state.inbox, {
                    notifications: action.notifications,
                    unreadCount: action.unreadCount
                })
            });
        case types.NEW_NOTIFICATION:
            return update(state, {
                inbox: {
                    notifications: {$unshift: [action.notification]},
                    unreadCount: {$set: action.unreadCount}
                }
            })
        case types.UPDATE_NOTIFICATION:
            return update(state, {
                inbox: {
                    notifications: { $set:
                        state.inbox.notifications.map(item =>
                            item.id === action.notification.id ?
                                Object.assign({}, item, action.notification) :
                                item
                    )},
                    unreadCount: {$set: action.unreadCount}
                }
            })
        case types.SET_PROCESS_STATE_PENDING:
            return Object.assign({}, state, {
                processStatus: 'pending'
            })
        case types.SET_PROCESS_STATE_SAVED:
            return Object.assign({}, state, {
                processStatus: 'saved'
            })

        default:
            return state
    }
}
