
import app from '~/app'

app.filter('tempTitleFilterToRemove',[ () => ((title) => title.replace(/^[\s:]*/, "")) ]); //app.filter