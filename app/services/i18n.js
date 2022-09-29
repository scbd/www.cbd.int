import cookies from 'js-cookie'

export const unLocales = [ 'ar', 'en', 'es', 'fr', 'ru', 'zh' ]

export const unLangMap = {
    'ar': 'العربية',
    'en': 'English',
    'es': 'Español',
    'fr': 'Français',
    'ru': 'Русский',
    'zh': '中文'
}


const getScbdCmsLocalePreference = () => {
    if(typeof window === 'undefined') return ''

    const pref = cookies.get('Preferences')

    if(pref) return (pref.replace('Locale=', ''))

    return ''
}

const getScbdLocaleSelected = () => {
    if(typeof window === 'undefined') return ''

    return cookies.get('locale') || ''
}

const html5Locale = () => {
    if(typeof window === 'undefined') return ''

    const htmlEl = document.querySelector('html')

    if(!htmlEl) return ''

    return htmlEl.getAttribute('lang') || ''
}

const legacyHtmlLocale = () => {
    if(typeof window === 'undefined' || typeof document === 'undefined') return ''

    const metaEl = document.querySelector('meta[http-equiv=content-language]')

    if(!metaEl) return ''

    return metaEl.getAttribute('content') || ''
}

const legacyBrowserLocale = () => {
    if(typeof navigator === 'undefined') return ''
    return (navigator.languages && navigator.languages.length) ? navigator.languages[0] : navigator.userLanguage || navigator.language || navigator.browserLanguage || ''
}

const browserLocale = () => {
    if(typeof Intl === 'undefined') return ''

    return (new Intl.NumberFormat())? (new Intl.NumberFormat()).resolvedOptions().locale : ''
}

export const getLocale = () => {
    const locale =  getScbdLocaleSelected()      || 
                    getScbdCmsLocalePreference() ||
                    html5Locale()                ||
                    legacyHtmlLocale()           ||
                    legacyBrowserLocale()        ||
                    browserLocale()

    return locale? locale.toLowerCase().slice(0, 2) : ''
}

export const getUnLocale = () => {
    const locale = getLocale()
    let returnLang     = 'en'

    if(!getScbdLocaleSelected() && !locale) cookies.set('locale', returnLang)

    if(!locale) return returnLang


    for (const lang of unLocales)
        if(locale.includes(lang))
            returnLang = lang

    if(!getScbdLocaleSelected()) cookies.set('locale', returnLang)

    return returnLang
}

export const setUnLocale = (toLocale) => {
    const fromLocale = getUnLocale()

    cookies.set('locale', toLocale)
    cookies.set('i18n_redirected', fromLocale)
}

