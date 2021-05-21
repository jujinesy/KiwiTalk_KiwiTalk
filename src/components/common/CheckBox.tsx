import React, { HTMLAttributes } from 'react';

import styled from 'styled-components';
import ThemeColor from '../../assets/colors/theme';

import RoundCheckBox from '../../assets/images/round_checkbox.svg';

const CheckBoxContainer = styled.div`
  display: flex;
  flex-direction: row;
  position: relative;
  cursor: pointer;
  font-size: 22px;
  user-select: none;
`;

const CheckBoxUnchecked = styled.div`
  padding-left: 14px;
  padding-top: 14px;
  border-radius: 2px;
  border: 2px ${ThemeColor.BLACK} solid;
  margin-right: 6px;
`;

const CheckBoxChecked = styled.img`
  width: 18px;
  height: 18px;
  margin-right: 6px;
  -webkit-user-drag: none;
`;

const CheckBoxLabel = styled.span`
  font-family: NanumBarunGothic;
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  line-height: 18px;
  color: ${ThemeColor.BLACK};
`;

interface CheckBoxProps extends HTMLAttributes<HTMLDivElement> {
  label: string
  checked: boolean
}

export const CheckBox: React.FC<CheckBoxProps> = ({
  label,
  checked,
  ...args
}) => {
  return (
    <CheckBoxContainer {...args}>
      {
        checked ?
          <CheckBoxChecked src={RoundCheckBox}/> :
          <CheckBoxUnchecked/>
      }
      <CheckBoxLabel>{label}</CheckBoxLabel>
    </CheckBoxContainer>
  );
};

export default CheckBox;
