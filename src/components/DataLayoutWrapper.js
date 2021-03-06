import React, { Component, cloneElement } from 'react';
import {connect} from 'react-redux';

import {
    patchRequest
} from '../actions/GenericActions';

import {
    parseToDisplay
} from '../actions/WindowActions';

class DataLayoutWrapper extends Component {
    constructor(props){
        super(props);

        this.state = {
            layout: [],
            data: [],
            dataId: null
        }
    }

    componentDidMount = () => {
        this.mounted = true;
    }

    componentWillUnmount = () => {
        this.mounted = false;
    }

    handleChange = (field, value) => {
        const {data} = this.state;

        this.setState({
            data: data.map(item => {
                if(item.field === field){
                    return Object.assign({}, item, {
                        value: value
                    })
                }else{
                    return item;
                }
            })
        })
    }

    handlePatch = (prop, value, cb) => {
        const {dispatch, entity, windowType, viewId} = this.props;
        const {dataId} = this.state;

        dispatch(patchRequest(
            entity, windowType, dataId, null, null, prop, value, null, null,
            null, viewId
        )).then(response => {
            const preparedData = parseToDisplay(response.data[0].fields);
            preparedData && preparedData.map(item => {
                this.setState({
                    data: this.state.data.map(field => {
                        if(field.field === item.field){
                            return Object.assign({}, field, item);
                        }else{
                            return field;
                        }
                    })
                });
            })
        });

        cb && cb();
    }

    setData = (data, dataId, cb) => {
        const preparedData = parseToDisplay(data);
        this.mounted && this.setState({
            data: preparedData,
            dataId: dataId
        }, () => {
            cb && cb();
        });
    }

    setLayout = (layout, cb) => {
        this.mounted && this.setState({
            layout: layout
        }, () => {
            cb && cb();
        });
    }

    render() {
        const {
            layout, data, dataId
        } = this.state;

        const {
            children, className
        } = this.props;

        return (
            <div
                className={className}
            >{
                // The nameing of props has a significant prefix
                // to suggest dev that these props are from wrapper
                cloneElement(children, Object.assign({}, this.props, {
                    DLWrapperData: data,
                    DLWrapperDataId: dataId,
                    DLWrapperLayout: layout,

                    DLWrapperSetData: this.setData,
                    DLWrapperSetLayout: this.setLayout,
                    DLWrapperHandleChange: this.handleChange,
                    DLWrapperHandlePatch: this.handlePatch
                }))
            }</div>
        )
    }
}

DataLayoutWrapper = connect()(DataLayoutWrapper)

export default DataLayoutWrapper;
