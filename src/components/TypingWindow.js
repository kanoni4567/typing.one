import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
/** @jsx jsx */
import { jsx, css } from '@emotion/core';

const matchCss = css`
    color: #1eb2a6;
`;

const nomatchCss = css`
    color: #f67575;
`;

const currentWordCss = css`
    color: #ffa34d;
`;
const defaultWordCss = css``;

const linesCss = css`
    transition: 0.15s;
`;

// const lineDiff = (oldLine, newLine) => {
//     var oldLineToCompare = oldLine.slice(0, newLine.length);
//     var remain = oldLine.slice(newLine.length);
//     let result = [];
//     let match = '';
//     let nomatch = '';
//     for (let i = 0; i < newLine.length; i++) {
//         const oldChar = oldLineToCompare[i];
//         const newChar = newLine[i];

//         if (oldChar === newChar) {
//             match += newChar;
//             if (nomatch.length) {
//                 result.push(<span css={nomatchCss}>{nomatch}</span>);
//                 nomatch = '';
//             }
//         } else {
//             nomatch += newChar;
//             if (match.length) {
//                 result.push(<span css={matchCss}>{match}</span>);
//                 match = '';
//             }
//         }
//     }
//     if (nomatch.length) {
//         result.push(<span css={nomatchCss}>{nomatch}</span>);
//         nomatch = '';
//     }
//     if (match.length) {
//         result.push(<span css={matchCss}>{match}</span>);
//         match = '';
//     }
//     remain = <span className="remain">{remain}</span>;
//     result = (
//         <>
//             {result}
//             {remain}
//         </>
//     );

//     return result;
// };

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
            const wordsOfLines = lines.map(line =>
                line
                    .trim()
                    .split(' ')
                    .map(word => ({
                        word: word,
                        correct: null
                    }))
            );
            setLines([...linesArr, ...wordsOfLines]);
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
    const [wordIndex, setWordIndex] = useState(0);
    const [inputLine, setInputLine] = useState('');

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

    // Handle enter and space key press
    useEffect(() => {
        const inputRef = inputEl.current;

        function handleEnter(e) {
            if (e.key === ' ') {
                e.preventDefault();
                if (inputRef.value !== '') {
                    // If it is not the last word increment currentWord,
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
        inputRef.addEventListener('keypress', handleEnter);
        return () => inputRef.removeEventListener('keypress', handleEnter);
    });

    return (
        <div>
            <div>{renderLines(lines, index, wordIndex, offset)}</div>
            <input
                css={
                    lines[index] && lines[index][wordIndex] && inputLine === lines[index][wordIndex].word.slice(0, inputLine.length)
                        ? css``
                        : css`
                              background-color: #f67575;
                          `
                }
                ref={inputEl}
                value={inputLine}
                onChange={e => setInputLine(e.target.value)}
            ></input>
        </div>
    );
}

const colorizeLine = (line, wordIndex) => {
    const result = [];
    for (let i = 0; i < line.length; i++) {
        const wordObj = line[i];
        let wordCss;
        if (wordObj.correct === true) {
            wordCss = matchCss;
        } else if (wordObj.correct === false) {
            wordCss = nomatchCss;
        } else if (i === wordIndex) {
            wordCss = currentWordCss;
        } else {
            wordCss = defaultWordCss;
        }
        result.push(<span css={wordCss}>{wordObj.word} </span>);
    }
    return result;
};

const renderLines = (lines, lineIndex, wordIndex, offset) => {
    return lines.map((line, i) => {
        if (i === lineIndex) {
            return (
                <p
                    css={css`
                        ${linesCss};
                        font-size: x-large;
                        font-weight: bold;
                    `}
                >
                    {colorizeLine(line, wordIndex)}
                    {/* {lineDiff(line, inputLine)} */}
                </p>
            );
        } else if (i > lineIndex - offset && i < lineIndex + offset) {
            return (
                <p css={linesCss}>
                    {colorizeLine(line, null)}
                    {/* {lineDiff(line, inputArr[i] || '')} */}
                </p>
            );
        }
    });
};
