import { useState } from "react";

function Counter() {
    const [count, setCount] = useState(0)

    return (
        <div>
            <h1>카운터 예제</h1>
            <p>현재값: {count}</p>
            <button onClick={()=> setCount(count-1)}>감소</button>
            <button onClick={()=> setCount(count+1)}>증가</button>
        </div>
    )
}

export default Counter