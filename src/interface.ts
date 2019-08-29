export interface IFieldComponentMap {
    [componentName: string]: any /* react 组件 */
    ;
}

export interface ILinkPropertyMap {
    [fieldName: string]: any;
}

export interface ILinkObject {
    fieldName: string;
    properties: string[];
}

export interface IFieldLink {
    processLinkedValueToLinkPropertyValue?: (linkedPropertyValue: any, linkProperty: string, valueMap: IFieldValueMap) => any;
    // tslint:disable-next-line:max-line-length
    onLinkedPropertyChange?: (linkedPropertyValue: any, linkProperties: string[], updateLinkPropertyValue: (linkPropertyMap: ILinkPropertyMap) => void) => void;
    linkObjects: ILinkObject[];
}

export interface IFieldDeclarationProperties {
    validateResult?: IValidateResult;
    [propertyName: string]: any;
}

export interface IValidateResult {
    pass: boolean;
    message?: string;
    [other: string]: any;
}

export interface IFieldDeclaration {
    componentName: string;
    fieldName: string;
    properties: IFieldDeclarationProperties;
    callbackValuePath: string[];
    link?: IFieldLink;
    valueName: string;
    validate?: (value: any) => IValidateResult;
    validateResultName?: string;
}

export interface IFieldValueMap {
    [fieldName: string]: any;
}
