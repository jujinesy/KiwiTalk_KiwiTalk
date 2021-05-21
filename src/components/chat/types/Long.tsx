import React, { createRef } from 'react';
import styled from 'styled-components';

import { Chat } from 'node-kakao';

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
`;

const Content = styled.span`
    white-space: pre-line;
`;

const Expansion = styled.button`
    background-color: rgba(0, 0, 0, 0.1);
    border: none;
    outline: none;
    border-radius: 9999px;
    color: black;
    padding: 4px;
    margin: 8px;
    cursor: pointer;
    
    transition: all 0.25s;
    
    :hover {
        background: rgba(0, 0, 0, 0.2);
    }
    :active {
        transform: scale(0.95);
    }
`;

interface LongChatProps {
    chat: Chat
}

export const Long: React.FC<LongChatProps> = (props: { chat: Chat }) => {
  const content = createRef() as React.RefObject<any>;
  const button = createRef() as React.RefObject<any>;

  let isExpanded = false;
  const expand = () => {
    isExpanded = !isExpanded;

    if (isExpanded) {
      content.current.innerText = props.chat.text;
      button.current.innerText = '접기';
    } else {
      content.current.innerText = props.chat.text?.substring(0, 500) + '...';
      button.current.innerText = '펼쳐보기';
    }

    content.current.scrollIntoView({
      behavior: 'smooth',
    });
  };

  return (
    <Wrapper>
      <Content ref={content}>{
        props.chat.text?.substring(0, 500) + '...'
      }</Content>
      <Expansion ref={button} onClick={expand}>{'펼쳐보기'}</Expansion>
    </Wrapper>
  );
};

export default Long;
