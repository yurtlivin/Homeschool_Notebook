import { createContext, useContext, useState, useEffect } from "react";
import { ANIMALS } from "./constants";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [activeUser, setActiveUser] = useState(null);
  const [userAvatars, setUserAvatars] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem("hs_active_user");
    const avatars = localStorage.getItem("hs_avatars");
    if (saved) setActiveUser(saved);
    if (avatars) setUserAvatars(JSON.parse(avatars));
  }, []);

  const switchUser = (name) => {
    setActiveUser(name);
    localStorage.setItem("hs_active_user", name);
  };

  const setAvatar = (userName, animalId) => {
    const updated = { ...userAvatars, [userName]: animalId };
    setUserAvatars(updated);
    localStorage.setItem("hs_avatars", JSON.stringify(updated));
  };

  const getAvatar = (userName) => {
    const id = userAvatars[userName];
    const animal = ANIMALS.find(a => a.id === id);
    return animal ? animal.emoji : "👤";
  };

  return (
    <UserContext.Provider value={{ activeUser, switchUser, userAvatars, setAvatar, getAvatar }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}