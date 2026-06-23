import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [usernameError, setUsernameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [confirmError, setConfirmError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const reqUserLen = username.length >= 6;
  const reqUserUpper = /[A-Z]/.test(username);
  const reqUserNum = /\d/.test(username);

  const reqPassLen = password.length >= 6;
  const reqPassUpper = /[A-Z]/.test(password);
  const reqPassNum = /\d/.test(password);
  const reqPassSpec = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  // Thêm async ở đây
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUsernameError(false);
    setPasswordError(false);
    setConfirmError(false);
    
    if (username.trim() === '' || password.trim() === '' || confirmPassword.trim() === '') {
      setError('Vui lòng điền đầy đủ tất cả thông tin!');
      return;
    }

    if (!reqUserLen || !reqUserUpper || !reqUserNum) {
      setUsernameError(true);
      return;
    }

    if (!reqPassLen || !reqPassUpper || !reqPassNum || !reqPassSpec) {
      setPasswordError(true);
      return;
    }

    if (password !== confirmPassword) {
      setConfirmError(true);
      return;
    }

    // Thêm await ở đây
    const result = await register(username, password);
    if (result.success) {
      alert('Đăng ký tài khoản thành công! Thử đăng nhập nhé.');
      navigate('/login');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-8">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 w-full max-w-md animate-[popIn_0.2s_ease-out]">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Tạo Tài Khoản</h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tài khoản</label>
            <input 
              type="text" 
              placeholder="Nhập tên tài khoản mới..." 
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (usernameError) setUsernameError(false);
              }}
              className={`px-3 py-2 bg-gray-50 border rounded-lg focus:outline-none focus:ring-1 text-xs w-full transition-all ${
                usernameError ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            <div className="mt-2 grid grid-cols-2 gap-1.5 text-[11px] font-medium">
              <span className={`transition-colors flex items-center gap-1.5 ${reqUserLen ? 'text-green-600' : 'text-gray-400'}`}>
                {reqUserLen ? '✓' : '•'} Ít nhất 6 ký tự
              </span>
              <span className={`transition-colors flex items-center gap-1.5 ${reqUserUpper ? 'text-green-600' : 'text-gray-400'}`}>
                {reqUserUpper ? '✓' : '•'} Ít nhất 1 chữ hoa
              </span>
              <span className={`transition-colors flex items-center gap-1.5 ${reqUserNum ? 'text-green-600' : 'text-gray-400'}`}>
                {reqUserNum ? '✓' : '•'} Ít nhất 1 chữ số
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Mật khẩu</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Tạo mật khẩu..." 
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError(false);
                }}
                className={`px-3 py-2 pr-10 bg-gray-50 border rounded-lg focus:outline-none focus:ring-1 text-xs w-full transition-all ${
                  passwordError ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-1.5 text-[11px] font-medium">
              <span className={`transition-colors flex items-center gap-1.5 ${reqPassLen ? 'text-green-600' : 'text-gray-400'}`}>
                {reqPassLen ? '✓' : '•'} Từ 6 ký tự
              </span>
              <span className={`transition-colors flex items-center gap-1.5 ${reqPassUpper ? 'text-green-600' : 'text-gray-400'}`}>
                {reqPassUpper ? '✓' : '•'} 1 chữ viết hoa
              </span>
              <span className={`transition-colors flex items-center gap-1.5 ${reqPassNum ? 'text-green-600' : 'text-gray-400'}`}>
                {reqPassNum ? '✓' : '•'} 1 chữ số
              </span>
              <span className={`transition-colors flex items-center gap-1.5 ${reqPassSpec ? 'text-green-600' : 'text-gray-400'}`}>
                {reqPassSpec ? '✓' : '•'} 1 ký tự đặc biệt
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nhập lại mật khẩu</label>
            <input 
              type="password" 
              placeholder="Xác nhận lại mật khẩu..." 
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (confirmError) setConfirmError(false);
              }}
              className={`px-3 py-2 bg-gray-50 border rounded-lg focus:outline-none focus:ring-1 text-xs w-full transition-all ${
                confirmError ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-blue-500'
              }`}
            />
            {confirmError && <p className="text-red-500 text-[11px] font-semibold mt-1">* Mật khẩu nhập lại không khớp!</p>}
          </div>

          {error && <p className="text-red-500 text-[11px] font-semibold bg-red-50 p-2 rounded border border-red-100">⚠️ {error}</p>}

          <button type="submit" className="w-full mt-2 py-2 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold rounded-lg text-xs shadow-sm transition-colors text-center cursor-pointer">
            Đăng ký tài khoản
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-5">
          Đã có tài khoản? <Link to="/login" className="text-blue-600 hover:underline font-bold">Đăng nhập ngay</Link>
        </p>
      </div>
    </div>
  );
}