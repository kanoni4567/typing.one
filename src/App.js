import React, { useState } from 'react';
import Diff from 'text-diff';
import ReactHtmlParser from 'react-html-parser';

import TypingWindow from './components/TypingWindow';
// import logo from './logo.svg';
import './App.css';

const api = 'https://meowfacts.herokuapp.com/';

// const renderResult = (initialLines, resultLines) => {
//     var diff = new Diff();
//     return (
//         <div>
//             {resultLines.map((line, i) => {
//                 var textDiff = diff.main(initialLines[i], line); // produces diff array
//                 diff.cleanupSemantic(textDiff);
//                 return ReactHtmlParser(
//                     `<p>${diff.prettyHtml(textDiff)}</p>`
//                 );
//             })}
//         </div>
//     );
// };


function App() {
    const [typing, setTyping] = useState(true);
    const [finishedLines, setFinishedLines] = useState([]);

    const finishTyping = completedLines => {
        setFinishedLines(completedLines);
        setTyping(false);
    };

    return (
        <div className="App">
            {typing ? (
                <TypingWindow api={api} setFinishedLines={finishTyping} />
            ) : (
                <div>
                    <button onClick={() => setTyping(true)}>Redo</button>
                </div>
            )}
        </div>
    );
}

export default App;
