import React, { useState, useEffect, useRef } from "react";
import Diff from "text-diff";
import ReactHtmlParser from "react-html-parser";
/** @jsx jsx */
import { jsx, css } from "@emotion/core";

const matchCss = css`
  background-color: #cdeac0;
`;

const nomatchCss = css`
  background-color: #ff928b;
`;

const diff = new Diff();

const lineDiff = (oldLine, newLine) => {
  var oldLineToCompare = oldLine.slice(0, newLine.length);
  var remain = oldLine.slice(newLine.length);
  let result = [];
  for (let i = 0; i < oldLineToCompare.length; i++) {
    const oldChar = oldLineToCompare[i];
    const newChar = newLine[i];
    if (oldChar === newChar) {
      result.push(<span css={matchCss}>{newChar}</span>);
    } else {
      result.push(<span css={nomatchCss}>{newChar}</span>);
    }
  }
  remain = <span className="remain">{remain}</span>;
  result = (
    <div>
      {result}
      {remain}
    </div>
  );

  return result;
  // var textDiff = diff.main(oldLineToCompare, newLine);
  // diff.cleanupSemantic(textDiff);
  // return ReactHtmlParser(diff.prettyHtml(textDiff) + '<span className="remaining">' + remain + '</span>');
};

export default function TypingWindow({ lines, setFinishedLines }) {
  const inputEl = useRef(null);

  const [index, setIndex] = useState(0);
  const [inputLine, setInputLine] = useState("");
  const defaultLines = new Array(lines.length);
  defaultLines.fill("");
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
      if (e.key === "Enter") {
        inputArr[index] = inputLine;
        setInputArr(inputArr);
        setInputLine("");
        setIndex(index + 1);
      }
    }
    const inputRef = inputEl.current;
    inputRef.addEventListener("keypress", handleEnter);
    return () => inputRef.removeEventListener("keypress", handleEnter);
  });

  return (
    <div>
      <div>
        {lines.map((line, i) => {
          if (i === index) {
            return <h1>{lineDiff(line, inputLine)}</h1>;
          } else {
            return <p>{lineDiff(line, inputArr[i])}</p>;
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
