import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
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

const useFocusInput = inputEl => {
    useEffect(() => {
        inputEl.current.focus();
    }, []);
};

const useFillLinesToMax = (api, linesArr, index, maxCount, setLines) => {
    useEffect(() => {
        const retrieveCount = maxCount - (linesArr.length - index);
        if (retrieveCount <= 0) {
            return;
        }
        const promises = [];
        for (let i = 0; i < retrieveCount; i++) {
            promises.push(axios.get(api));
        }
        Promise.all(promises).then(responses => {
            // console.log(responses.map(res => res.data.data[0]))
            setLines([...linesArr, ...responses.map(res => res.data.data[0])]);
        });
        return () => {};
    }, [linesArr, maxCount, setLines, api, index]);
};

export default function TypingWindow({
    defaultLines,
    setFinishedLines,
    api,
    offset
}) {
    if (!offset) {
        offset = 3;
    }
    const inputEl = useRef(null);
    const [lines, setLines] = useState(defaultLines || []);
    const [index, setIndex] = useState(0);
    const [inputLine, setInputLine] = useState('');
    const [inputArr, setInputArr] = useState([]);

    useFillLinesToMax(api, lines, index, 5, setLines);

    // focus input when first rendered
    useFocusInput(inputEl);

    // Completed all lines
    // useEffect(() => {
    //     if (index >= lines.length) {
    //         setFinishedLines(inputArr);
    //     }
    //     return;
    // }, [index, setFinishedLines, lines.length, inputArr]);

    // Handle enter key press
    useEffect(() => {
        function handleEnter(e) {
            if (e.key === 'Enter' || inputLine.length >= lines[index].length) {
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
                    } else if (i > index - offset && i < index + offset) {
                        return (
                            <p css={linesCss}>
                                {lineDiff(line, inputArr[i] || '')}
                            </p>
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
