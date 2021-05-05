import { getUnLocale           } from 'locale'
import   siteNavigationElement   from './siteNavigationElements'

const locale = getUnLocale()

const options = {
  dapi       : 'https://dapi.cbd.int',
  static     : false,
  siteNavigationElement,
  locale
}

export default options