import { getUnLocale            } from 'locale'
import   siteNavigationElements   from './footerSiteNavigationElements'

const locale = getUnLocale()

const options = {
  dapi       : 'https://gnejqz0dk6.execute-api.us-east-1.amazonaws.com/production',
  static                : false,
  siteNavigationElements,
  locale
}

export  default options