import { useState } from "react";

function Counter({ msg }) {
  const [count, setCount] = useState(0);

  return (
    <>
      <h1>{msg}</h1>

      <div className="card">
        <button type="button" onClick={() => setCount(count + 1)}>
          Count is {count}
        </button>
        <p>
          Edit
          <code>components/Counter.jsx</code> to test HMR
        </p>
      </div>

      <p>
        Check out
        <a
          href="https://reactjs.org/docs/getting-started.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          Create React App
        </a>
        , the official React starter
      </p>
      <p>
        Learn more about IDE Support for React in the
        <a
          href="https://reactjs.org/docs/add-react-to-a-website.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          React Docs
        </a>
        .
      </p>
      <p className="read-the-docs">
        Click on the React and Vite logos to learn more
      </p>
    </>
  );
}

export default Counter;
