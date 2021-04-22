import app from '~/app'
import nlp from 'nlp'
  
  app.filter('titleCase',[function () {
    return function (text) {
      var doc = nlp(text).all().toTitleCase()

      doc.prepositions().toLowerCase()
      doc.conjunctions().toLowerCase()

      doc.match('#Determiner').toLowerCase()
      doc.match('#Article').toLowerCase()

      return doc.all().text()
    };
  }]); //app.filter