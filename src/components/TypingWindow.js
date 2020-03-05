import React, { useState, useEffect, useRef } from 'react';

export default function TypingWindow({ lines, setFinishedLines }) {
    const inputEl = useRef(null);
    const [index, setIndex] = useState(0);
    const [inputLine, setInputLine] = useState('');
    const defaultLines = new Array(lines.length);
    defaultLines.fill('');
    const [inputArr, setInputArr] = useState(defaultLines);

    // focus input when first rendered
    useEffect(() => {
        inputEl.current.focus();
    }, []);

    // Completed all lines
    useEffect(() => {
        if (index >= lines.length) {
            setFinishedLines(inputArr);
        }
        return;
    }, [index, setFinishedLines, lines.length, inputArr]);

    // Handle enter key press
    useEffect(() => {
        function handleEnter(e) {
            if (e.key === 'Enter') {
                inputArr[index] = inputLine;
                setInputArr(inputArr);
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
            <div>
                {lines.map((line, i) => {
                    if (i === index) {
                        return <h1>{line}</h1>;
                    } else {
                        return <p>{line}</p>;
                    }
                })}
            </div>
            <input
                ref={inputEl}
                value={inputLine}
                onChange={e => setInputLine(e.target.value)}
            ></input>
        </div>
    );
}
