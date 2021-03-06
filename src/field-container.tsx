import React, {FC, Fragment, ReactElement, useCallback} from 'react';
import {IFieldComponentMap, IFieldDeclaration, IFieldLink, IFieldValueMap} from './interface';

export interface IFieldContainerProps {
    componentMap: IFieldComponentMap;
    fieldDeclarations: IFieldDeclaration[];
    valueMap: IFieldValueMap;
    onChange: (value: any, fieldName: string, link: IFieldLink) => void;
}

export interface IFieldComponentProps {
    componentName: string;
    fieldName: string;
    callbackValuePath: string[];
    componentMap: IFieldComponentMap;
    link?: IFieldLink;
    onChange: (value: any, fieldName: string, link?: IFieldLink) => void;
}

interface IDataMap {
    [name: string]: IDataMap;
}

const FieldComponent: FC<IFieldComponentProps> = (props: IFieldComponentProps): ReactElement | null => {
    const {componentName, fieldName, callbackValuePath, componentMap, onChange, link, ...restProperties} = props;
    const CComponent: ReactElement = componentMap[componentName];

    const handleChange = useCallback((data: IDataMap) => {
        if (onChange) {
            onChange(callbackValuePath.reduce((pv: IDataMap, cv: string): any => pv[cv], data), fieldName, link);
        }
    }, [fieldName, link, onChange, callbackValuePath]);
    if (CComponent == null) {
        // tslint:disable-next-line:no-console
        console.warn(`Component '${componentName}' is not exist.`);
        return null;
    }
    // @ts-ignore
    return <CComponent onChange={handleChange} {...restProperties}/>;
};

const FieldContainer: FC<IFieldContainerProps> = (props: IFieldContainerProps): ReactElement => {
    const {componentMap, fieldDeclarations, valueMap, onChange} = props;
    const handleChange = useCallback((value, fieldName, link) => {
        if ( onChange ) {
            onChange(value, fieldName, link);
        }
    }, [onChange]);
    return <Fragment>
        {
            fieldDeclarations.map(
                ({componentName, properties, fieldName, callbackValuePath = [], link, valueName = 'value'}) => {
                    const supplementaryValueMap = {[valueName]: valueMap[fieldName]};
                    return <FieldComponent
                        {...properties}
                        {...supplementaryValueMap}
                        componentName={componentName}
                        componentMap={componentMap}
                        fieldName={fieldName}
                        callbackValuePath={callbackValuePath}
                        onChange={handleChange}
                        link={link}
                        key={fieldName}/>;
                })
        }
    </Fragment>;
};

export default FieldContainer;
