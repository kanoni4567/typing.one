import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
/** @jsx jsx */
import { jsx, css } from '@emotion/core';

const rootCss = css`
    width: 70rem;
    height: 25rem;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    border-radius: 0.5rem;
    padding: 0 2rem; 
`;

const linesContainerCss = css`
    text-align: center;
    width: 100%;
    margin: auto;
`;

const inputBaseCss = css`
    width: 50%;
    margin: 1.5rem 0;
    font: inherit;
    padding: 0.2rem 0.6rem;
    border: none;
`;

const linesBaseCss = css`
    transition: 0.15s;
    padding: 0.5rem 0;
    width: 100%;
`;

const mainLineCss = css`
    ${linesBaseCss};
    font-size: x-large;
    font-weight: bold;
    padding: 1rem 0;
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
            // api specific filter (cat facts)
            const lines = responses.map(res => res.data.data[0]).filter(line => line.length < 100 && !line.match(/(http)|(subscribe)|(valid)/g));
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
        offset = 4;
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

    let inputCss = [
        inputBaseCss,
        css`
            background-color: ${theme.inputColor};
        `
    ];
    if (
        lines[index] &&
        lines[index][wordIndex] &&
        inputLine !== lines[index][wordIndex].word.slice(0, inputLine.length)
    ) {
        inputCss = [
            inputCss,
            css`
                background-color: ${theme.inputErrorColor};
            `
        ];
    }

    return (
        <div css={[rootCss, css`background-color: ${theme.mainContainerColor};`]}>
            <div css={linesContainerCss}>
                {renderLines(lines, index, wordIndex, offset, wpmArr, theme)}
            </div>
            <input
                css={inputCss}
                ref={inputEl}
                value={inputLine}
                onChange={e => setInputLine(e.target.value)}
            ></input>
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

const renderLines = (lines, lineIndex, wordIndex, offset, wpmArr, theme) => {
    let result = []
    if (lineIndex - offset < 0) {
        for (let i = 0; i < offset - lineIndex - 1; i++) {
            result.push(<p css={linesBaseCss}>-</p>)
        }
    }
    return [result, lines.map((line, i) => {
        if (i === lineIndex) {
            return (
                <p css={mainLineCss}>{colorizeLine(line, wordIndex, theme)}</p>
            );
        } else if (i > lineIndex - offset && i < lineIndex + offset) {
            return (
                <p css={linesBaseCss}>
                    {colorizeLine(line, null, theme)}{' '}
                    <span
                        css={css`
                            color: ${theme.defaultColor};
                            display: block;
                            float: right;
                            font-weight: bold;
                        `}
                    >
                        {wpmArr[i] ? 'WPM: ' + wpmArr[i] : ''}
                    </span>
                </p>
            );
        }
    })];
};
