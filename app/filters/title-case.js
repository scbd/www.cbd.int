define(['app', 'nlp'], function (app, nlp) {

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
}); //define