import {fireEvent, render} from '@testing-library/react';
import React from 'react';
import RForm from '../index';
import basicConfig from '../../stories/basic-config';
test('基础表单测试 点击默认值为true的Checkbox 结果应为false', async () => {
    const {getByTestId} = render(<RForm {...basicConfig} />);
    fireEvent.click(getByTestId('sex'));
    expect(getByTestId('sex')).toHaveProperty('checked', false);
});

test('表单联动测试 点击默认值为true的Checkbox为false 与之关联的Input添加disabled属性', async () => {
    const {getByTestId} = render(<RForm {...basicConfig} />);
    fireEvent.click(getByTestId('sex'));
    expect(getByTestId('name')).toHaveProperty('disabled', true);
});
