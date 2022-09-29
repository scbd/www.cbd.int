import { getUnLocale                                  } from 'locale'
import   mainSNEs                                       from './mainSNEs'
import   siteNavElms                                    from './pageHeaderFixedSiteNavigationElements'

const name   = 'PageFixedHeader'
const locale = getUnLocale()

const options = {
  accountsUrl: 'https://accounts.cbd.int',
  searchUrl  : 'https://www.cbd.int/kb/Results?q=',
  host       : 'https://www.cbd.int',
  signOutUrl : 'https://www.cbd.int/user/signout',
  dapi       : 'https://gnejqz0dk6.execute-api.us-east-1.amazonaws.com/production',
  static     : false,
  basePath   : 'https://www.cbd.int/',
  loginSNEs  : [],
  mainSNEs,
  siteNavElms,
  locale, 
  signOut: ()=>undefined
}

export default options