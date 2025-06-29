'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDownIcon, CheckIcon } from 'lucide-react';

// supported languages
const languages = [
  { code: 'en', name: 'English', region: 'United States' },
  { code: 'zh', name: '简体中文', region: 'China' },
  { code: 'es', name: 'español', region: 'España' },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  // click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* current language button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:text-gray-900 bg-gray-100 rounded-md transition-colors border border-gray-200 hover:border-gray-300"
      >
        <span className="font-medium">{currentLanguage.name}</span>
        <span className="text-gray-400">{currentLanguage.region}</span>
        <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 bottom-[50px] mt-2 w-64 bg-gray-100 rounded-lg shadow-lg border border-gray-200 p-2 z-50">
          {languages.map(language => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className="w-full flex items-center gap-3 px-4 py-2 text-xs hover:bg-gray-200 transition-colors"
            >
              {/* selected state indicator */}
              <div className="w-4 h-4 flex items-center justify-center">
                {i18n.language === language.code && <CheckIcon className="w-4 h-4 text-black" />}
              </div>

              {/* language name and region */}
              <div className="flex items-start gap-3">
                <span className="font-medium text-gray-900 w-12 text-left">{language.name}</span>
                {language.region && (
                  <span className="text-xs text-gray-400">{language.region}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
