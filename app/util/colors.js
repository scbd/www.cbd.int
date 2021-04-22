//http://www.sitepoint.com/javascript-generate-lighter-darker-color/


  function randomHexColor(start, end) {
    start = start || 0;
    end = end || 16777215;
    return '#' + Math.floor(start + Math.random() * end).toString(16);
  }

  function changeLum(hex, lum) {

    // validate hex string
    hex = String(hex).replace(/[^0-9a-f]/gi, '');
    if (hex.length < 6) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    lum = lum || 0;

    // convert to decimal and change luminosity
    var rgb = '#',
      c, i;
    for (i = 0; i < 3; i++) {
      c = parseInt(hex.substr(i * 2, 2), 16);
      c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
      rgb += ('00' + c).substr(c.length);
    }

    return rgb;
  }

  export default {
    changeLum: changeLum,
    randomHexColor: randomHexColor
  };

