"use client";

import { useEffect, useState } from "react";
import { getFirstTenUsers } from "@/app/lib/data";

const UsersPage = () => {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    // Llamar al método para obtener los primeros 10 usuarios
    async function fetchUsers() {
      const userList = await getFirstTenUsers();
      setUsers(userList);
    }

    fetchUsers();
  }, []);

  return (
    <div>
      <h1>First 10 Users</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <strong>Name:</strong> {user.name} | <strong>Email:</strong>{" "}
            {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UsersPage;
