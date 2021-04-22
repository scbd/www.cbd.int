import $ from 'jquery';

export function title(val) {

    let title = $(`head > title`);

         if(val===undefined) return title.text();
    else if(val===null)      title.remove();
    else {
        if(title.length==0) {
            title = $(document.createElement('title'));
            $('head').append(meta)
        }

        title.text(val);
    }

    return metas(['og:title'], val);
}

export function description(val) {
      return metas(['description', 'og:description'], val);
}

export function siteName(val) {
    return metas(['og:site_name'], val);
}

export function image(val) {
    const retVal = metas(['og:image'], val);

    if(val)        metas(['twitter:card'], 'summary_large_image');
    if(val===null) metas(['twitter:card'], null);

    return retVal;
}

export function canonicalUrl(val) {
    return metas(['og:url'], val);
}

function metas(names, value) {

    if(value===undefined) //read 1st one defined;
        return names.map(n => meta(n)).find(v=>v!==undefined);

    // set all
    names.forEach(name => meta(name, value));
}

const metaProps = {
    'name':     [/^twitter:/i],
    'property': [/^article:/, /^fb:/i],
    'http-equiv': [/^x-ua-compatible$/i]
}

function getPropertyName(name) {
    for (const [prop, patterns] of Object.entries(metaProps)) {
        if(!patterns.some(p=>p.test(name))) continue;

        return prop;
    }

    return 'name';
}

export function meta(name, value) {

    const prop = getPropertyName(name);

    let meta  = $(`head > meta[${prop}="${name}"]`);

    if(value===undefined)
        return meta.attr('content');

    if(value===null) {
        meta.remove();
        return;
    }

    if(!meta.length) {
        meta = $(document.createElement('meta'));
        meta.attr(prop, name);
        $('head').append(meta)
    }

    meta.attr('content', value)

    return value;
}