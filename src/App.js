import React, { useState } from 'react';
import Diff from 'text-diff';
import ReactHtmlParser from 'react-html-parser';

import TypingWindow from './components/TypingWindow';
// import logo from './logo.svg';
import './App.css';

const lines = 'Agora tenho de partir \npara longe e sempre \nsem nunca mais voltar. \nEu devo novamente fugir \ncomo tantas vezes durante a vida \nindo embora sem chorar \ndepois de outra luta perdida. \nParto mas hoje eu sei \nque jamais voltarei \naqui ou a qualquer lugar.'.split(
    '\n'
);

var diff = new Diff();

function App() {
    const [typing, setTyping] = useState(true);
    const [finishedLines, setFinishedLines] = useState([]);

    const finishTyping = completedLines => {
        setFinishedLines(completedLines);
        setTyping(false);
    };

    const renderResult = (initialLines, resultLines) => {
        return (
            <div>
                {resultLines.map((line, i) => {
                    var textDiff = diff.main(initialLines[i], line); // produces diff array
                    diff.cleanupSemantic(textDiff);
                    return ReactHtmlParser(`<p>${diff.prettyHtml(textDiff)}</p>`);
                })}
                <button onClick={() => setTyping(true)}>Redo</button>
            </div>
        );
    };

    return (
        <div className="App">
            {typing ? (
                <TypingWindow lines={lines} setFinishedLines={finishTyping} />
            ) : (
                renderResult(lines, finishedLines)
            )}
        </div>
    );
}

export default App;
