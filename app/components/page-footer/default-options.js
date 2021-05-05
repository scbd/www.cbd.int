import { getUnLocale            } from 'locale'
import   siteNavigationElements   from './footerSiteNavigationElements'

const locale = getUnLocale()

const options = {
  dapi                  : 'https://dapi.cbd.int',
  static                : false,
  siteNavigationElements,
  locale
}

export  default options