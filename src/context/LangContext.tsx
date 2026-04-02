import React, { createContext, useContext, useState } from 'react';

// Hindi translations
const translations: Record<string, Record<string, string>> = {
  en: {
    appName: 'ParaliBridge',
    tagline: 'Every October, Punjab burns 20M tonnes of parali. We built the marketplace to stop it.',
    iAmFarmer: "I'm a Farmer",
    iAmBuyer: "I'm a Buyer",
    registerField: 'Register your field',
    findSupply: 'Find supply',
    farmer: 'Farmer',
    buyer: 'Buyer',
    impact: 'Impact',
    alerts: 'Alerts',
    registerStraw: 'Register Straw',
    findBuyers: 'Find Buyers',
    myTransactions: 'My Transactions',
    greenCertificates: 'Green Certificates',
    fireAlerts: 'Fire Alerts Map',
    postDemand: 'Post Demand',
    incomingRequests: 'Incoming Requests',
    activeTransactions: 'Active Transactions',
    complianceReport: 'Compliance Report',
    logout: 'Logout',
    loginTitle: 'Welcome back',
    signupTitle: 'Join ParaliBridge',
    email: 'Email address',
    password: 'Password',
    fullName: 'Full Name',
    district: 'District',
    selectDistrict: 'Select district',
    login: 'Login',
    signup: 'Sign Up',
    switchToSignup: "Don't have an account? Sign up",
    switchToLogin: 'Already have an account? Login',
    landAcres: 'Land size (acres)',
    upiId: 'UPI ID',
    submit: 'Submit',
    estimatedTonnes: 'Estimated Straw',
    selectBuyer: 'Select This Buyer',
    verified: 'Verified',
    acceptTransaction: 'Accept Transaction',
    simulateNextStep: 'Simulate Next Step',
    downloadCertificate: 'Download Certificate',
    listOnExchange: 'List on Carbon Exchange',
    exportReport: 'Export Report',
    sendSmsAlert: 'Send SMS Alert',
    dispatchNearest: 'Dispatch Nearest',
  },
  hi: {
    appName: 'पराली ब्रिज',
    tagline: 'हर अक्टूबर, पंजाब 2 करोड़ टन पराली जलाता है। हमने इसे रोकने के लिए यह मार्केटप्लेस बनाया।',
    iAmFarmer: 'मैं किसान हूं',
    iAmBuyer: 'मैं खरीदार हूं',
    registerField: 'अपना खेत रजिस्टर करें',
    findSupply: 'आपूर्ति खोजें',
    farmer: 'किसान',
    buyer: 'खरीदार',
    impact: 'प्रभाव',
    alerts: 'अलर्ट',
    registerStraw: 'पराली रजिस्टर करें',
    findBuyers: 'खरीदार खोजें',
    myTransactions: 'मेरे लेनदेन',
    greenCertificates: 'हरित प्रमाणपत्र',
    fireAlerts: 'आग अलर्ट मानचित्र',
    postDemand: 'मांग पोस्ट करें',
    incomingRequests: 'आने वाले अनुरोध',
    activeTransactions: 'सक्रिय लेनदेन',
    complianceReport: 'अनुपालन रिपोर्ट',
    logout: 'लॉगआउट',
    loginTitle: 'वापस स्वागत है',
    signupTitle: 'पराली ब्रिज से जुड़ें',
    email: 'ईमेल पता',
    password: 'पासवर्ड',
    fullName: 'पूरा नाम',
    district: 'जिला',
    selectDistrict: 'जिला चुनें',
    login: 'लॉगिन',
    signup: 'साइन अप',
    switchToSignup: 'खाता नहीं है? साइन अप करें',
    switchToLogin: 'पहले से खाता है? लॉगिन करें',
    landAcres: 'जमीन का आकार (एकड़)',
    upiId: 'UPI ID',
    submit: 'जमा करें',
    estimatedTonnes: 'अनुमानित पराली',
    selectBuyer: 'इस खरीदार को चुनें',
    verified: 'सत्यापित',
    acceptTransaction: 'लेनदेन स्वीकार करें',
    simulateNextStep: 'अगला चरण',
    downloadCertificate: 'प्रमाणपत्र डाउनलोड करें',
    listOnExchange: 'कार्बन एक्सचेंज पर सूचीबद्ध करें',
    exportReport: 'रिपोर्ट निर्यात करें',
    sendSmsAlert: 'SMS अलर्ट भेजें',
    dispatchNearest: 'निकटतम भेजें',
  },
};

interface LangContextType {
  lang: 'en' | 'hi';
  setLang: (l: 'en' | 'hi') => void;
  t: (key: string) => string;
}

const LangContext = createContext<LangContextType | null>(null);

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within LangProvider');
  return ctx;
}

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<'en' | 'hi'>('en');

  function t(key: string): string {
    return translations[lang][key] || translations['en'][key] || key;
  }

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}
