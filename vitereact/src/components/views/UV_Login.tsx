// ===== 3. CORRECTED LOGIN VIEW EXAMPLE =====
// Shows proper Zustand usage in views

import React, { useState } from 'react';
import { useAppStore } from '@/store/main';
import collaborationWorkspaceImage from '@/assets/collaboration-workspace.png';

// Translation object for Arabic
const translations = {
  en: {
    createAccount: 'Create your account',
    signIn: 'Sign in to your account',
    fullName: 'Full Name',
    emailAddress: 'Email address',
    password: 'Password',
    creatingAccount: 'Creating account...',
    signingIn: 'Signing in...',
    createAccountBtn: 'Create account',
    signInBtn: 'Sign in',
    alreadyHaveAccount: 'Already have an account? Sign in',
    dontHaveAccount: "Don't have an account? Sign up",
    altText: 'Real-time Collaboration Workspace'
  },
  ar: {
    createAccount: 'إنشاء حسابك',
    signIn: 'تسجيل الدخول إلى حسابك',
    fullName: 'الاسم الكامل',
    emailAddress: 'عنوان البريد الإلكتروني',
    password: 'كلمة المرور',
    creatingAccount: 'جاري إنشاء الحساب...',
    signingIn: 'جاري تسجيل الدخول...',
    createAccountBtn: 'إنشاء حساب',
    signInBtn: 'تسجيل الدخول',
    alreadyHaveAccount: 'لديك حساب بالفعل؟ سجل الدخول',
    dontHaveAccount: 'ليس لديك حساب؟ سجل الآن',
    altText: 'مساحة عمل التعاون في الوقت الفعلي'
  }
};

const UV_Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  
  // CRITICAL: Individual selectors, no object destructuring
  const isLoading = useAppStore(state => state.authentication_state.authentication_status.is_loading);
  const errorMessage = useAppStore(state => state.authentication_state.error_message);
  const loginUser = useAppStore(state => state.login_user);
  const registerUser = useAppStore(state => state.register_user);
  const clearAuthError = useAppStore(state => state.clear_auth_error);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();
    
    try {
      if (isRegisterMode) {
        await registerUser(email, password, name);
      } else {
        await loginUser(email, password);
      }
    } catch (error) {
      // Error is handled in store
      console.error('Authentication error:', error);
    }
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    clearAuthError();
    setEmail('');
    setPassword('');
    setName('');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const t = translations[language];

  return (
    <>
      <div className={`min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={toggleLanguage}
                className="text-blue-600 hover:text-blue-500 text-sm font-medium px-3 py-1 border border-blue-600 rounded-md"
              >
                {language === 'en' ? 'العربية' : 'English'}
              </button>
            </div>
            <div className="flex justify-center mb-6">
              <img 
                src={collaborationWorkspaceImage} 
                alt={t.altText} 
                className="max-w-full h-auto rounded-lg shadow-sm"
              />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {isRegisterMode ? t.createAccount : t.signIn}
            </h2>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                <p className="text-sm">{errorMessage}</p>
              </div>
            )}
            
            <div className="space-y-4">
              {isRegisterMode && (
                <div>
                  <label htmlFor="name" className="sr-only">
                    {t.fullName}
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required={isRegisterMode}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.fullName}
                    className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    dir={language === 'ar' ? 'rtl' : 'ltr'}
                  />
                </div>
              )}
              
              <div>
                <label htmlFor="email" className="sr-only">
                  {t.emailAddress}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailAddress}
                  className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  dir={language === 'ar' ? 'rtl' : 'ltr'}
                />
              </div>
              
              <div>
                <label htmlFor="password" className="sr-only">
                  {t.password}
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isRegisterMode ? "new-password" : "current-password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.password}
                  className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  dir={language === 'ar' ? 'rtl' : 'ltr'}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isRegisterMode ? t.creatingAccount : t.signingIn}
                  </span>
                ) : (
                  isRegisterMode ? t.createAccountBtn : t.signInBtn
                )}
              </button>
            </div>
            
            <div className="text-center">
              <button
                type="button"
                onClick={toggleMode}
                className="text-blue-600 hover:text-blue-500 text-sm font-medium"
              >
                {isRegisterMode 
                  ? t.alreadyHaveAccount
                  : t.dontHaveAccount
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default UV_Login;