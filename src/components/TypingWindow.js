import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
/** @jsx jsx */
import { jsx, css } from '@emotion/core';

const innerPadding = css`
    padding: 0 2rem;
`;

const headerWrapperCss = css`
    @media (min-width: 420px) {
        min-width: 55rem;
    }
    ${'' /* min-height: 15rem; */}
    max-width: 80vw;
    display: flex;
    flex-direction: column;
`;

const headerCss = css`
    height: 1.5rem;
    display: flex;
    justify-content: flex-end;
    padding: 0.5rem 1.5rem;
`;

const headerContentCss = css`
    font-size: 1rem;
`;

const mainContainerCss = css`
    ${innerPadding}
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    border-radius: 0.5rem;
    flex: 1 0 auto;
`;

const linesContainerCss = css`
    text-align: center;
    width: 100%;
    margin: auto;
    margin-top: 1.5rem;
`;

const singleLineContainerCss = css`
    position: relative;
`;

const inputBaseCss = css`
    width: 50%;
    margin: 1.5rem 0;
    font-size: 1.2rem;
    font: inherit;
    padding: 0.2rem 0.6rem;
    border: none;
`;

const linesBaseCss = css`
    transition: 0.15s;
    padding: 0.5rem 0;
`;

const mainLineCss = css`
    ${linesBaseCss};
    font-size: 1.4rem;
    font-weight: bold;
    padding: 1rem 0;
`;

const lineWpmCss = css`
    ${linesBaseCss}
    position: absolute;
    top: 0;
    right: 0;
    font-size: 1rem;
`;

const useFocusInput = inputEl => {
    useEffect(() => {
        inputEl.current.focus();
    }, [inputEl]);
};

const useFillLinesToMax = (apis, linesArr, index, maxCount, setLines) => {
    useEffect(() => {
        const retrieveCount = maxCount - (linesArr.length - index);
        if (retrieveCount <= 0) {
            return;
        }
        const promises = [];
        for (let i = 0; i < retrieveCount; i++) {
            promises.push(
                axios.get(apis[Math.floor(Math.random() * apis.length)])
            );
        }
        Promise.all(promises).then(responses => {
            // api specific filter (cat facts)
            const lines = responses
                .map(res => (res.data.data ? res.data.data[0] : res.data.quote))
                .filter(
                    line =>
                        line.length < 100 &&
                        !line.match(/(http)|(subscribe)|(valid)/g)
                );
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
    }, [linesArr, maxCount, setLines, apis, index]);
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

export default function TypingWindow({
    defaultLines,
    apis,
    historyOffset,
    theme
}) {
    if (!historyOffset) {
        historyOffset = 5;
    }
    const inputEl = useRef(null);
    const [lines, setLines] = useState(defaultLines || []);
    const [index, setIndex] = useState(0);
    const [wordIndex, setWordIndex] = useState(0);
    const [inputLine, setInputLine] = useState('');

    // focus input when first rendered
    useFocusInput(inputEl);

    useFillLinesToMax(apis, lines, index, 5, setLines);

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
            color: ${theme.inputTextColor};
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
        <div css={headerWrapperCss}>
            <div css={headerCss}>
                <div
                    css={css`
                        ${headerContentCss}
                        color: ${theme.headerColor};
                    `}
                >
                    WPM
                </div>
            </div>
            <div
                css={[
                    mainContainerCss,
                    css`
                        background-color: ${theme.mainContainerColor};
                    `
                ]}
            >
                <div css={linesContainerCss}>
                    {renderLines(
                        lines,
                        index,
                        wordIndex,
                        historyOffset,
                        wpmArr,
                        theme
                    )}
                </div>
                <input
                    css={inputCss}
                    ref={inputEl}
                    value={inputLine}
                    onChange={e => setInputLine(e.target.value)}
                ></input>
            </div>
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
        result.push(
            <span key={i} css={wordCss}>
                {wordObj.word}{' '}
            </span>
        );
    }
    return result;
};

const renderLines = (
    lines,
    lineIndex,
    wordIndex,
    historyOffset,
    wpmArr,
    theme
) => {
    let result = [];
    // for (let i = 0; i < historyOffset - lineIndex; i++) {
    //     result.push(
    //         <div css={singleLineContainerCss} key={`emtpy${i}`}>
    //             <div
    //                 css={css`
    //                     ${linesBaseCss};
    //                     color: ${theme.defaultColor};
    //                 `}
    //             >
    //                 -
    //             </div>
    //         </div>
    //     );
    // }
    return [
        ...result,
        lines.map((line, i) => {
            if (i > lineIndex - historyOffset && i < lineIndex + 2) {
                return (
                    <div css={singleLineContainerCss} key={i}>
                        <div css={i === lineIndex ? mainLineCss : linesBaseCss}>
                            {colorizeLine(
                                line,
                                i === lineIndex ? wordIndex : null,
                                theme
                            )}
                        </div>
                        <div
                            css={css`
                            ${lineWpmCss}
                            color: ${theme.wpmColor};
                        `}
                        >
                            {wpmArr[i] ? wpmArr[i] : ''}
                        </div>
                    </div>
                );
            }
        })
    ];
};
