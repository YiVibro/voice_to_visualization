import React, { useState } from "react";
import { Editor } from "@monaco-editor/react";

const MonacoEditorComponent = () => {
  const [code, setCode] = useState("// Write JavaScript here...");
  const [output, setOutput] = useState("");

  // Function to execute the code
  const runCode = () => {
    try {
      // Use Function constructor to safely evaluate code
      const result = new Function(code)();
      setOutput(result !== undefined ? result.toString() : "Code executed successfully!");
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    }
  };

  return (
    <div style={{ height: "90vh", padding: "20px", background: "#282c34", color: "white" }}>
      <h2>SQL Editor</h2>
      <Editor
        height="50vh"
        width="100%"
        defaultLanguage="javascript"
        defaultValue={code}
        onChange={(value) => setCode(value)}
        theme="vs-dark"
      />
      <button onClick={runCode} style={{ margin: "10px", padding: "10px", fontSize: "16px" }}>
        Run Code
      </button>
      <h3>Output:</h3>
      <pre style={{ background: "#1e1e1e", padding: "10px", borderRadius: "5px" }}>
        {output}
      </pre>
    </div>
  );
};

export default MonacoEditorComponent;
