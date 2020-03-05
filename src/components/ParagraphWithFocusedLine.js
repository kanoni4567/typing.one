import React from 'react'

export default function ParagraphWithFocusedLine({
    textArr,
    focusedIndex
}) {
    return (
        <div>
            {textArr.map((line, index) => {
                if (index === focusedIndex) {
                    return <h1>{line}</h1>
                } else {
                    return <p>{line}</p>
                }
            })}
        </div>
    )
}
