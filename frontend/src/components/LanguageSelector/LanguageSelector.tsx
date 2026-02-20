import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '../../i18n/config';
import { Button } from '../UI';

interface LanguageSelectorProps {
  className?: string;
  variant?: 'dropdown' | 'inline';
}

/**
 * Language selector component for switching between supported languages
 * Supports both dropdown and inline button layouts
 * Persists language preference to localStorage
 */
export function LanguageSelector({ 
  className = '', 
  variant = 'dropdown' 
}: LanguageSelectorProps) {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language as SupportedLanguage;

  const handleLanguageChange = (lng: SupportedLanguage) => {
    i18n.changeLanguage(lng);
  };

  if (variant === 'inline') {
    return (
      <div className={`flex gap-2 flex-wrap ${className}`}>
        {(Object.entries(SUPPORTED_LANGUAGES) as Array<[SupportedLanguage, typeof SUPPORTED_LANGUAGES[SupportedLanguage]]>).map(
          ([code, lang]) => (
            <Button
              key={code}
              onClick={() => handleLanguageChange(code)}
              variant={currentLanguage === code ? 'primary' : 'outline'}
              size="sm"
              className="whitespace-nowrap"
              aria-label={`Switch to ${lang.nativeName}`}
              aria-pressed={currentLanguage === code}
              title={`${lang.name} - ${lang.region}`}
            >
              <span className="mr-1">{lang.flag}</span>
              {lang.nativeName}
            </Button>
          )
        )}
      </div>
    );
  }

  return (
    <div className={`relative group ${className}`}>
      <Button
        variant="outline"
        size="md"
        className="flex items-center gap-2"
        aria-label="Select language"
        aria-haspopup="menu"
        aria-expanded="false"
      >
        <span className="text-lg">
          {SUPPORTED_LANGUAGES[currentLanguage]?.flag}
        </span>
        <span className="hidden sm:inline">
          {SUPPORTED_LANGUAGES[currentLanguage]?.nativeName}
        </span>
        <svg
          className="w-4 h-4 transition-transform group-hover:rotate-180"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </Button>

      <div
        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border border-gray-200"
        role="menu"
      >
        {(Object.entries(SUPPORTED_LANGUAGES) as Array<[SupportedLanguage, typeof SUPPORTED_LANGUAGES[SupportedLanguage]]>).map(
          ([code, lang]) => (
            <button
              key={code}
              onClick={() => handleLanguageChange(code)}
              className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-100 transition-colors ${
                currentLanguage === code ? 'bg-blue-50 border-l-4 border-blue-500' : ''
              } ${code === 'en' ? 'rounded-t-lg' : ''} ${
                code === 'sw' ? 'rounded-b-lg' : ''
              }`}
              role="menuitem"
              aria-label={`Switch to ${lang.nativeName}`}
              aria-current={currentLanguage === code ? 'true' : 'false'}
              title={`${lang.name} - ${lang.region}`}
            >
              <span className="text-xl">{lang.flag}</span>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{lang.nativeName}</div>
                <div className="text-xs text-gray-500">{lang.region}</div>
              </div>
              {currentLanguage === code && (
                <svg
                  className="w-5 h-5 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          )
        )}
      </div>
    </div>
  );
}
