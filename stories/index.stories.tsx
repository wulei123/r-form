import React from 'react';

import {storiesOf} from '@storybook/react';
import RForm from '../src/index';
import asyncLinkConfig from './async-link-config';
import basicConfig from './basic-config';
import './index.css';
import validateConfig from './validate-config';

storiesOf('RForm', module)
    .add('基本', () => <RForm {...basicConfig}/>)
    .add('异步关联', () => <RForm {...asyncLinkConfig} />)
    .add('表单验证', () => <RForm {...validateConfig}/>);
