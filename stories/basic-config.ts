import {Checkbox, Input} from 'antd';
import {IRFormProps} from '../src';
import {IFieldDeclaration, IFieldValueMap} from '../src/interface';
const componentMap = {
    Checkbox,
    Input,
};
const fieldDeclarations: IFieldDeclaration[] = [
    {
        callbackValuePath: ['target', 'checked'],
        componentName: 'Checkbox',
        fieldName: 'sex',
        link: {
            linkObjects: [{
                fieldName: 'name',
                properties: ['value', 'disabled'],
            }],
            processLinkedValueToLinkPropertyValue: (val, property) => {
                switch (property) {
                    case 'value':
                        return val ? 'a' : 'b';
                    case 'disabled':
                        return !val;
                }
            },
        },
        properties: {
            defaultChecked: true,
        },
        valueName: 'value',
    },
    {
        callbackValuePath: ['target', 'value'],
        componentName: 'Input',
        fieldName: 'name',
        properties: {
            defaultValue: 'Mike',
        },
        valueName: 'value',
    },
];

const valueMap: IFieldValueMap = {};

const handleReset = (values: IFieldValueMap) => {
    // tslint:disable-next-line:no-console
    console.log(values);
};

const handleSave = (values: IFieldValueMap) => {
    // tslint:disable-next-line:no-console
    console.log(values);
};
const rFormProps: IRFormProps = {
    componentMap, fieldDeclarations,  onReset: handleReset, onSave: handleSave, valueMap,
};

export default rFormProps;
