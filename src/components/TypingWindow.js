import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
/** @jsx jsx */
import { jsx, css } from '@emotion/core';

const linesContainerCss = css``;

const inputBaseCss = css`
    margin: 1.5rem 0;
`;

const linesBaseCss = css`
    transition: 0.15s;
    padding: 0.2rem 0;
`;

const mainLineCss = css`
    ${linesBaseCss};
    font-size: x-large;
    font-weight: bold;
    padding: 1rem 0;
`;

const inputErrorCss = css`
    background-color: #f67575;
`;

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
            const lines = responses.map(res => res.data.data[0]);
            const wordsOfLines = lines
                .map(line =>
                    line
                        .trim()
                        .split(' ')
                        .map(word => ({
                            word: word,
                            correct: null
                        }))
                )
                .filter(line => line.length < 20);
            setLines([...linesArr, ...wordsOfLines]);
        });
        return () => {};
    }, [linesArr, maxCount, setLines, api, index]);
};

const useWpmArr = (lines, lineIndex) => {
    const [wpmArr, setWpmArr] = useState([]);
    const [lastStartTime, setLastStartTime] = useState(Date.now());
    useEffect(() => {
        if (lineIndex > 0) {
            const correctKeyCount = lines[lineIndex - 1].reduce(
                (prev, curr) => prev + (curr.correct ? curr.word.length : 0),
                0
            );
            const words = correctKeyCount / 5;
            const minutes = (Date.now() - lastStartTime) / 1000 / 60;
            let wpm = Math.floor(words / minutes);
            wpmArr.push(wpm);
            setWpmArr(wpmArr);
            setLastStartTime(Date.now());
        }
    }, [lineIndex]);
    return wpmArr;
};

export default function TypingWindow({ defaultLines, api, offset, theme }) {
    if (!offset) {
        offset = 3;
    }
    const inputEl = useRef(null);
    const [lines, setLines] = useState(defaultLines || []);
    const [index, setIndex] = useState(0);
    const [wordIndex, setWordIndex] = useState(0);
    const [inputLine, setInputLine] = useState('');

    // focus input when first rendered
    useFocusInput(inputEl);

    useFillLinesToMax(api, lines, index, 5, setLines);

    const wpmArr = useWpmArr(lines, index);

    // Handle enter and space key press
    useEffect(() => {
        const inputRef = inputEl.current;

        function handleKeyPress(e) {
            if (e.key === ' ') {
                e.preventDefault();
                if (inputRef.value !== '') {
                    if (wordIndex < lines[index].length - 1) {
                        if (inputRef.value === lines[index][wordIndex].word) {
                            lines[index][wordIndex].correct = true;
                        } else {
                            lines[index][wordIndex].correct = false;
                        }
                        setInputLine('');
                        setWordIndex(wordIndex + 1);
                    }
                }
            }
            if (
                e.key === 'Enter' ||
                (e.key === ' ' && wordIndex === lines[index].length - 1)
            ) {
                if (inputRef.value === lines[index][wordIndex].word) {
                    lines[index][wordIndex].correct = true;
                } else {
                    lines[index][wordIndex].correct = false;
                }
                for (const wordObj of lines[index]) {
                    if (wordObj.correct === null) {
                        wordObj.correct = false;
                    }
                }
                setInputLine('');
                setIndex(index + 1);
                setWordIndex(0);
            }
            setLines(lines);
        }
        inputRef.addEventListener('keypress', handleKeyPress);
        return () => inputRef.removeEventListener('keypress', handleKeyPress);
    });

    let inputCss = inputBaseCss;
    if (
        lines[index] &&
        lines[index][wordIndex] &&
        inputLine !== lines[index][wordIndex].word.slice(0, inputLine.length)
    ) {
        inputCss = [inputCss, inputErrorCss];
    }

    return (
        <div>
            <div css={linesContainerCss}>
                {renderLines(lines, index, wordIndex, offset, theme)}
            </div>
            <input
                css={inputCss}
                ref={inputEl}
                value={inputLine}
                onChange={e => setInputLine(e.target.value)}
            ></input>
            <p>{wpmArr[wpmArr.length - 1]}</p>
        </div>
    );
}

const colorizeLine = (line, wordIndex, theme) => {
    const result = [];
    for (let i = 0; i < line.length; i++) {
        const wordObj = line[i];
        let wordCss;
        if (wordObj.correct === true) {
            wordCss = css`
                color: ${theme.matchColor};
            `;
        } else if (wordObj.correct === false) {
            wordCss = css`
                color: ${theme.nomatchColor};
            `;
        } else if (i === wordIndex) {
            wordCss = css`
                color: ${theme.currentColor};
            `;
        } else {
            wordCss = css`
                color: ${theme.defaultColor};
            `;
        }
        result.push(<span css={wordCss}>{wordObj.word} </span>);
    }
    return result;
};

const renderLines = (lines, lineIndex, wordIndex, offset, theme) => {
    return lines.map((line, i) => {
        if (i === lineIndex) {
            return (
                <p css={mainLineCss}>{colorizeLine(line, wordIndex, theme)}</p>
            );
        } else if (i > lineIndex - offset && i < lineIndex + offset) {
            return <p css={linesBaseCss}>{colorizeLine(line, null, theme)}</p>;
        }
    });
};
