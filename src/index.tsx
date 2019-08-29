import produce from 'immer';
import React, {FC, ReactElement, useCallback, useState} from 'react';
import FieldContainer from './field-container';
import {IFieldComponentMap, IFieldDeclaration, IFieldLink, IFieldValueMap, ILinkObject} from './interface';

export interface IRFormProps {
    componentMap: IFieldComponentMap;
    fieldDeclarations: IFieldDeclaration[];
    valueMap: IFieldValueMap;
    onSave: (values: IFieldValueMap) => void;
    onReset: (values: IFieldValueMap) => void;
}

export interface ILinkFieldDeclaration {
    fieldDeclaration: IFieldDeclaration;
    linkObject: ILinkObject;
}

export interface IAsyncOptProperty {
    property: string;
    result: Promise<any>;
}

const DEFAULT_VALIDATE_RESULT_NAME = 'validateResult';

const getLinkFieldDeclarations =
    (link: IFieldLink, fieldDeclarations: IFieldDeclaration[]): ILinkFieldDeclaration[] => {
        if (link && link.linkObjects) {
            return link.linkObjects.map((linkObject) => {
                const fieldDeclaration = fieldDeclarations.find((field) => field.fieldName === linkObject.fieldName);
                return fieldDeclaration ? {
                    fieldDeclaration,
                    linkObject,
                } : null;
            }).filter((fd) => fd !== null);
        }
        return [];
    };
const getProcessLinkedValueToLinkPropertyValue = (val: any, link: IFieldLink, property: string, valueMap: IFieldValueMap) =>
    link.processLinkedValueToLinkPropertyValue
        ? link.processLinkedValueToLinkPropertyValue(val, property, valueMap)
        : val;
const useFieldDeclarationsAndValueMap = (defaultFieldDeclarations: IFieldDeclaration[], defaultValueMap: IFieldValueMap) => {
    const [valueMap, setValueMap] = useState(defaultValueMap);
    const [fieldDeclarations, setFieldDeclarations] = useState(defaultFieldDeclarations);
    const updateLinkObjectProperty = useCallback((newVal: any, fieldName: string, link: IFieldLink) => {
        const asyncOptsPropertyMap: Map<string, IAsyncOptProperty[]> = new Map<string, IAsyncOptProperty[]>();
        const asyncOptsValueMap: Map<string, Promise<any>> = new Map<string, Promise<any>>();
        const {valueMap: nextValueMap, fieldDeclarations: nextFieldDeclarations} =
            produce({
                fieldDeclarations,
                valueMap,
            }, ({valueMap: draftValueMap, fieldDeclarations: draftFieldDeclarations}) => {
                draftValueMap[fieldName] = newVal;
                const linkFieldDeclarations = getLinkFieldDeclarations(link, draftFieldDeclarations);
                linkFieldDeclarations.forEach(({linkObject, fieldDeclaration}) => {
                    linkObject.properties
                        .forEach((property) => {
                            const result = getProcessLinkedValueToLinkPropertyValue(newVal, link, property, valueMap);
                            if (property === fieldDeclaration.valueName) {
                                if (typeof result.then === 'function') {
                                    asyncOptsValueMap.set(fieldDeclaration.fieldName, result);
                                    return;
                                }
                                draftValueMap[linkObject.fieldName] = result;
                            } else {
                                if (typeof result.then === 'function') {
                                    asyncOptsValueMap[fieldDeclaration.fieldName] = result;
                                    const properties = asyncOptsPropertyMap.get(fieldDeclaration.fieldName);
                                    asyncOptsPropertyMap
                                        .set(fieldDeclaration.fieldName,
                                            Array.isArray(properties) ? [...properties, {property, result}] : [{property, result}]);
                                    return;
                                }
                                fieldDeclaration.properties[property] = result;
                            }
                        });
                });
            });
        setValueMap(nextValueMap);
        setFieldDeclarations(nextFieldDeclarations);
        if (asyncOptsValueMap.size > 0) {
            asyncOptsValueMap.forEach((result, fName) => {
                result.then((value) => {
                    setValueMap(produce(nextValueMap, (draftValueMap) => {
                        draftValueMap[fName] = value;
                    }));
                });
            });
            asyncOptsValueMap.clear();
        }
        if (asyncOptsPropertyMap.size > 0) {
            asyncOptsPropertyMap.forEach((propertyOpts, fName) => {
                propertyOpts.forEach((po) => {
                    po.result.then((value) => {
                        setFieldDeclarations(produce(nextFieldDeclarations, (draftFieldDeclarations) => {
                            const fDeclaration = draftFieldDeclarations.find((fd) => fd.fieldName === fName);
                            fDeclaration.properties[po.property] = value;
                        }));
                    });
                });
            });
            asyncOptsPropertyMap.clear();
        }
    }, [fieldDeclarations, valueMap]);
    const reset = () => {
        setValueMap(valueMap);
        setFieldDeclarations(fieldDeclarations);
    };
    const validate = () => {
        const nextFD = produce(fieldDeclarations, (draftFieldDeclarations) => {
            draftFieldDeclarations.forEach((fieldDeclaration) => {
                fieldDeclaration.validateResultName = fieldDeclaration.validateResultName || DEFAULT_VALIDATE_RESULT_NAME;
                if (!fieldDeclaration.properties) {
                    fieldDeclaration.properties = {};
                }
                if (typeof fieldDeclaration.validate === 'function') {
                    fieldDeclaration.properties[fieldDeclaration.validateResultName]
                        = fieldDeclaration.validate(valueMap[fieldDeclaration.fieldName]);
                    return;
                }
                fieldDeclaration.properties[fieldDeclaration.validateResultName] = {pass: true};
            });
        });
        setFieldDeclarations(nextFD);
        return nextFD.every((fd) => fd.properties[fd.validateResultName].pass);
    };
    return {
        fieldDeclarations, resetAllProperties: reset, updateLinkObjectProperty, validate, valueMap,
    };
};

const RForm: FC<IRFormProps> = (props: IRFormProps): ReactElement => {
    const {componentMap, fieldDeclarations: defaultFieldDeclarations, valueMap: defaultValueMap, onSave, onReset} = props;
    const {
        fieldDeclarations,
        valueMap,
        updateLinkObjectProperty,
        resetAllProperties,
        validate,
    } = useFieldDeclarationsAndValueMap(defaultFieldDeclarations, defaultValueMap);
    const handleFieldsChange = useCallback((newVal: any, fieldName: string, link: IFieldLink) => {
        updateLinkObjectProperty(newVal, fieldName, link);
    }, [updateLinkObjectProperty]);

    const handleSave = useCallback(() => {
        const isAllPass = validate();
        if (onSave && isAllPass) {
            onSave(valueMap);
        }
    }, [onSave, validate, valueMap]);

    const handleReset = useCallback(() => {
        resetAllProperties();
        if (onReset) {
            onReset(valueMap);
        }
    }, [onReset, resetAllProperties, valueMap]);

    return <div>
        <FieldContainer
            componentMap={componentMap}
            fieldDeclarations={fieldDeclarations}
            valueMap={valueMap}
            onChange={handleFieldsChange}/>
        <div>
            <button onClick={handleSave}>保存</button>
            <button onClick={handleReset}>重置</button>
        </div>
    </div>;
};

export default RForm;
