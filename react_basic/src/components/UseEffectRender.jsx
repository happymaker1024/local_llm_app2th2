import { useEffect, useState } from "react";
import axios from "axios";

function UseEffectRender() {
  const [models, setModels] = useState([]);
  const URL = "http://localhost:8000/models";

  useEffect(() => {
    axios
      .get(URL)
      .then((response) => {
        setModels(response.data.models || []);
      })
      .catch((error) => {
        console.error("모델 목록 조회 오류:", error);
      });
  }, []);

  return (
    <main>
      <h1>모델 목록</h1>

      <ul>
        {models.map((model) => (
          <li key={model}>{model}</li>
        ))}
      </ul>
    </main>
  );
}

export default UseEffectRender;


// import { useEffect, useState } from "react";
// function UseEffectRender() {
//  const [models, setModels] = useState([]);
//  const URL = "http://localhost:8000/models"

//  useEffect(() => {
//     // fetch() 함수 사용, javascript 내장되어 있음.
//     fetch(URL)
//     .then((response) => response.json())
//     .then((data) => setModels(data.models || []))
//     .catch((error) => console.error(error));
//     }, []); // [] 처음 실행될 때 한번만 실행하도록 함

//  return (
//     <main>
//         <h1>모델 목록</h1>
//         <ul>
//         {models.map((model) => (
//         <li key={model}>{model}</li>
//         ))}
//         </ul>
//     </main>
//     );
// }
// export default UseEffectRender;