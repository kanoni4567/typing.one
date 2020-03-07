import React, { useState, useEffect, useRef } from 'react';
/** @jsx jsx */
import { jsx, css } from '@emotion/core';

const matchCss = css`
    background-color: #cdeac0;
`;

const nomatchCss = css`
    background-color: #ff928b;
`;

const linesCss = css`
    transition: 0.15s;
`;

const lineDiff = (oldLine, newLine) => {
    var oldLineToCompare = oldLine.slice(0, newLine.length);
    var remain = oldLine.slice(newLine.length);
    let result = [];
    let match = '';
    let nomatch = '';
    for (let i = 0; i < newLine.length; i++) {
        const oldChar = oldLineToCompare[i];
        const newChar = newLine[i];

        if (oldChar === newChar) {
            match += newChar;
            if (nomatch.length) {
                result.push(<span css={nomatchCss}>{nomatch}</span>);
                nomatch = '';
            }
        } else {
            nomatch += newChar;
            if (match.length) {
                result.push(<span css={matchCss}>{match}</span>);
                match = '';
            }
        }
    }
    if (nomatch.length) {
        result.push(<span css={nomatchCss}>{nomatch}</span>);
        nomatch = '';
    }
    if (match.length) {
        result.push(<span css={matchCss}>{match}</span>);
        match = '';
    }
    remain = <span className="remain">{remain}</span>;
    result = (
        <>
            {result}
            {remain}
        </>
    );

    return result;
};

export default function TypingWindow({ lines, setFinishedLines, api }) {
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
                        return (
                            <p
                                css={css`
                                    ${linesCss};
                                    font-size: x-large;
                                    font-weight: bold;
                                `}
                            >
                                {lineDiff(line, inputLine)}
                            </p>
                        );
                    } else {
                        return (
                            <p css={linesCss}>{lineDiff(line, inputArr[i])}</p>
                        );
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
