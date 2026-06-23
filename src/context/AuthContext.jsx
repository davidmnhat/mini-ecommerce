import { createContext, useState, useContext, useEffect } from 'react';
import { hashPassword } from '../utils/crypto';

const AuthContext = createContext();

const REGISTERED_USERS_KEY = 'registeredUsers';

const getRegisteredUsers = () => {
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Đồng bộ lại nếu user đăng nhập/đăng xuất ở tab khác (không bắt buộc nhưng hữu ích)
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'user') {
        setUser(e.newValue ? JSON.parse(e.newValue) : null);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const login = async (username, password) => {
    try {
      const res = await fetch('/data/user.json');
      const staticUsers = await res.json();
      const registeredUsers = getRegisteredUsers();
      const allUsers = [...staticUsers, ...registeredUsers];

      const inputUser = String(username || '').trim();
      const inputPassHash = await hashPassword(String(password || ''));

      const validUser = allUsers.find((u) => {
        const jsonUser = String(u.username || '').trim();
        const jsonPassHash = String(u.password || '');
        return jsonUser === inputUser && jsonPassHash === inputPassHash;
      });

      if (validUser) {
        const fakeToken = btoa(JSON.stringify({ id: validUser.id, role: 'user', time: Date.now() }));
        const userData = { id: validUser.id, name: validUser.name, username: validUser.username };

        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('accessToken', fakeToken);

        return { success: true };
      }

      return { success: false, message: 'Sai tên đăng nhập hoặc mật khẩu!' };
    } catch (err) {
      console.error('Lỗi đọc file user.json:', err);
      return { success: false, message: 'Lỗi hệ thống, hãy kiểm tra lại file user.json!' };
    }
  };

  const register = async (username, password) => {
    try {
      const res = await fetch('/data/user.json');
      const staticUsers = await res.json();
      const registeredUsers = getRegisteredUsers();
      const allUsers = [...staticUsers, ...registeredUsers];

      const inputUser = String(username || '').trim();

      const isDuplicate = allUsers.some(
        (u) => String(u.username || '').trim().toLowerCase() === inputUser.toLowerCase()
      );

      if (isDuplicate) {
        return { success: false, message: 'Tên đăng nhập đã được sử dụng!' };
      }

      const newUser = {
        id: Date.now(),
        name: inputUser,
        username: inputUser,
        password: await hashPassword(String(password || '')),
      };

      const updatedRegisteredUsers = [...registeredUsers, newUser];
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updatedRegisteredUsers));

      return { success: true };
    } catch (err) {
      console.error('Lỗi đăng ký:', err);
      return { success: false, message: 'Lỗi hệ thống, vui lòng thử lại sau!' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
  };

  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components -- hook tiện ích đi kèm Provider trong cùng file là pattern thường gặp
export const useAuth = () => useContext(AuthContext);
