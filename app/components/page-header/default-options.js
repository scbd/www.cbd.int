import { getUnLocale           } from 'locale'
import   siteNavigationElement   from './siteNavigationElements'

const locale = getUnLocale()

const options = {
  dapi       : 'https://gnejqz0dk6.execute-api.us-east-1.amazonaws.com/production',
  static     : false,
  siteNavigationElement,
  locale
}

export default options