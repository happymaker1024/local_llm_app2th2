// rafce  : react arrow function comfonent export
// rfce   : react function comfonent export
import React from 'react'

function ListRending() {

    // 배열 데이터
    const messages = [
    { id: 1, role: "user", content: "안녕하세요." },
    { id: 2, role: "assistant", content: "무엇을 도와드릴까요?" },
    { id: 3, role: "user", content: "Local LLM에 대해 알여줘" },
    { id: 4, role: "user", content: "Local LLM은 ~~~~~" },
    ];

    return (
        <main>
        <h1>메시지 목록</h1>
        {messages.map((message) => (
            <div key={message.id}>
                <strong>{message.role}</strong>
                <p>{message.content}</p>
            </div>
        ))}
        </main>
    )
}

export default ListRending
