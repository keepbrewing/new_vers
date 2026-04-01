import { useState } from "react";
import axios from "axios";

export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [data, setData] = useState([]);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/admin/login", {
        username,
        password
      });

      if (res.data.success) {
        setLoggedIn(true);

        const d = await axios.get("http://localhost:5000/api/admin/data");
        setData(d.data);
      }
    } catch {
      alert("Invalid login");
    }
  };

  const exportCSV = () => {
    window.open("http://localhost:5000/api/admin/export");
  };

  // � LOGIN SCREEN
  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl space-y-4">
          <h2>Admin Login</h2>

          <input
            placeholder="Username"
            onChange={e => setUsername(e.target.value)}
          />

          <input
            placeholder="Password"
            type="password"
            onChange={e => setPassword(e.target.value)}
          />

          <button onClick={handleLogin}>
            Login
          </button>
        </div>
      </div>
    );
  }

  // � DASHBOARD
  return (
    <div className="p-6">

      <div className="flex justify-between mb-4">
        <h2>Participants</h2>
        <button onClick={exportCSV}>Download CSV</button>
      </div>

      <table className="w-full border">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Gender</th>
            <th>Responses</th>
          </tr>
        </thead>

        <tbody>
          {data.map(p => (
            <tr key={p._id}>
              <td>{p.participantId}</td>
              <td>{p.name}</td>
              <td>{p.gender}</td>
              <td>{p.responses.length}</td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}