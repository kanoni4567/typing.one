import React, { useState, useEffect, useRef } from 'react';
import ParagraphWithFocusedLine from './ParagraphWithFocusedLine';

export default function TypingWindow({ lines, setFinishedLines }) {
    const inputEl = useRef(null);
    const [index, setIndex] = useState(0);
    const [inputLine, setInputLine] = useState('');
    const [inputArr, setInputArr] = useState([]);

    useEffect(() => {
        inputEl.current.focus();
    }, []);

    useEffect(() => {
        if (index >= lines.length) {
            setFinishedLines(inputArr);
        }
        return;
    }, [index, setFinishedLines, lines.length, inputArr]);

    useEffect(() => {
        function handleEnter(e) {
            if (e.key === 'Enter') {
                setInputArr([...inputArr, inputLine]);
                setInputLine('');
                setIndex(index + 1);
            }
        }
        const inputRef = inputEl.current;
        inputRef.addEventListener('keypress', handleEnter);
        return () => inputRef.removeEventListener('keypress', handleEnter);
    });

    return (
        <div>
            <ParagraphWithFocusedLine
                textArr={lines}
                focusedIndex={index}
                inputArr={inputArr}
            ></ParagraphWithFocusedLine>
            <input
                ref={inputEl}
                value={inputLine}
                onChange={e => setInputLine(e.target.value)}
            ></input>
        </div>
    );
}
