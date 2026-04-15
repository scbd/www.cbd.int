export { default as template } from './index.html'

export default ['user', function(user) {
  this.isAuthenticated = user.isAuthenticated;
  this.isKronosUser    = user.institution=='CBD' && (user.roles.includes('Kronos-User') || user.roles.includes('Kronos-FullAccess'));
}];
