import React, { useState, useEffect, useRef } from 'react';
import ParagraphWithFocusedLine from './ParagraphWithFocusedLine';

const lines = 'Agora tenho de partir \npara longe e sempre \nsem nunca mais voltar. \nEu devo novamente fugir \ncomo tantas vezes durante a vida \nindo embora sem chorar \ndepois de outra luta perdida. \nParto mas hoje eu sei \nque jamais voltarei \naqui ou a qualquer lugar.'.split(
    '\n'
);

export default function TypingWindow() {
    const inputEl = useRef(null);
    const [index, setIndex] = useState(0);
    const [inputLine, setInputLine] = useState('');

    useEffect(() => {
        function handleEnter(e) {
            if (e.key === 'Enter') {
                console.log(inputEl.current.value);
                setInputLine('');
                console.log("increase index")
                setIndex(index + 1);
            }
        }
        inputEl.current.addEventListener('keypress', handleEnter);
        return () =>
            inputEl.current.removeEventListener('keypress', handleEnter);
    });
    return (
        <div>
            <ParagraphWithFocusedLine
                textArr={lines}
                focusedIndex={index}
                inputLine={inputLine}
            ></ParagraphWithFocusedLine>
            <input
                ref={inputEl}
                value={inputLine}
                onChange={e => setInputLine(e.target.value)}
            ></input>
        </div>
    );
}
