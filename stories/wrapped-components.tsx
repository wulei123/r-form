import {Input} from 'antd';
import React from 'react';

export const InputValidateWrapper = (props) => {
    const {validateResult, ...restProps} = props;
    return <div> <label>{validateResult && validateResult.message}</label> <Input {...restProps}/> </div>;
};
