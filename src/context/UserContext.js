import React, { createContext, useState } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    email: null,
    createdAt: null,
    contactbar: null,
    subscribedCategories: [], // Separate array for subscribed categories
    nonSubscribedCategories: [], // Separate array for non-subscribed categories
  });

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
