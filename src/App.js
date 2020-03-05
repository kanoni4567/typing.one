import React, { useState } from 'react';
import TypingWindow from './components/TypingWindow';
// import logo from './logo.svg';
import './App.css';

const lines = 'Agora tenho de partir \npara longe e sempre \nsem nunca mais voltar. \nEu devo novamente fugir \ncomo tantas vezes durante a vida \nindo embora sem chorar \ndepois de outra luta perdida. \nParto mas hoje eu sei \nque jamais voltarei \naqui ou a qualquer lugar.'.split(
    '\n'
);

function App() {
    const [typing, setTyping] = useState(true);
    const [finishedLines, setFinishedLines] = useState([]);

    const finishTyping = completedLines => {
        setFinishedLines(completedLines);
        setTyping(false);
    };

    const renderResult = lines => {
        return (
            <div>
                {lines.map(line => (
                    <p>{line}</p>
                ))}
                <button onClick={() => setTyping(true)}>Redo</button>
            </div>
        );
    };

    return (
        <div className="App">
            {typing ? (
                <TypingWindow lines={lines} setFinishedLines={finishTyping} />
            ) : (
                renderResult(finishedLines)
            )}
        </div>
    );
}

export default App;
