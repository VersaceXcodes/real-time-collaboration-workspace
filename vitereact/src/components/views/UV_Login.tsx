import React, { useState } from 'react';
import { useAppStore } from '@/store/main';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Mail, Lock, User, Globe } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  
  // CRITICAL: Individual selectors, no object destructuring
  const isLoading = useAppStore(state => state.authentication_state.authentication_status.is_loading);
  const errorMessage = useAppStore(state => state.authentication_state.error_message);
  const loginUser = useAppStore(state => state.login_user);
  const registerUser = useAppStore(state => state.register_user);
  const clearAuthError = useAppStore(state => state.clear_auth_error);

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (isRegisterMode && !name.trim()) {
      errors.name = 'Full name is required';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    clearAuthError();
    setFieldErrors({});
    
    try {
      if (isRegisterMode) {
        await registerUser(email, password, name);
      } else {
        await loginUser(email, password);
      }
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    clearAuthError();
    setFieldErrors({});
    setEmail('');
    setPassword('');
    setName('');
    setShowPassword(false);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const t = translations[language];

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="max-w-md w-full space-y-8">
        {/* Language Toggle */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLanguage}
            className="flex items-center gap-2 hover:bg-blue-50 transition-colors"
            aria-label={`Switch to ${language === 'en' ? 'Arabic' : 'English'} language`}
          >
            <Globe className="h-4 w-4" />
            {language === 'en' ? 'العربية' : 'English'}
          </Button>
        </div>

        {/* Header Image */}
        <div className="flex justify-center">
          <div className="relative">
            <img 
              src={collaborationWorkspaceImage} 
              alt={t.altText} 
              className="max-w-full h-auto rounded-xl shadow-lg transition-transform hover:scale-105"
            />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        </div>

        {/* Main Card */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center text-gray-900">
              {isRegisterMode ? t.createAccount : t.signIn}
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              {isRegisterMode 
                ? 'Join our collaborative workspace today' 
                : 'Welcome back to your workspace'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Global Error Message */}
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2" role="alert" aria-live="polite">
                <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                <p className="text-sm">{errorMessage}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field (Register Mode) */}
              {isRegisterMode && (
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {t.fullName}
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.fullName}
                    className={`transition-all ${fieldErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'focus:border-blue-500 focus:ring-blue-500'}`}
                    dir={language === 'ar' ? 'rtl' : 'ltr'}
                  />
                  {fieldErrors.name && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                      {fieldErrors.name}
                    </p>
                  )}
                </div>
              )}
              
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {t.emailAddress}
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailAddress}
                  className={`transition-all ${fieldErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'focus:border-blue-500 focus:ring-blue-500'}`}
                  dir={language === 'ar' ? 'rtl' : 'ltr'}
                />
                {fieldErrors.email && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                    {fieldErrors.email}
                  </p>
                )}
              </div>
              
              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  {t.password}
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={isRegisterMode ? "new-password" : "current-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.password}
                    className={`pr-10 transition-all ${fieldErrors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'focus:border-blue-500 focus:ring-blue-500'}`}
                    dir={language === 'ar' ? 'rtl' : 'ltr'}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                {fieldErrors.password && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none"
                size="lg"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    {isRegisterMode ? t.creatingAccount : t.signingIn}
                  </span>
                ) : (
                  isRegisterMode ? t.createAccountBtn : t.signInBtn
                )}
              </Button>
              
              {/* Toggle Mode */}
              <div className="text-center pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={toggleMode}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                >
                  {isRegisterMode 
                    ? t.alreadyHaveAccount
                    : t.dontHaveAccount
                  }
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UV_Login;