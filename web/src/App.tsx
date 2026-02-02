import { useEffect, useState } from "react";

const endpoint = import.meta.env.DEV
  ? "http://localhost:3000/api/hello"
  : "/api/hello";

export default function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => setMessage(data.message));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-2xl">{message || "Loading..."}</p>
    </div>
  );
}
