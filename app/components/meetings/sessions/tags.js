import { startCase }  from 'lodash'

const tags = {
    'not-delivered' : { 
        public: true,
        title: 'Not delivered' 
    },
    'not-for-interpretation' : {
        public: false,
        title: 'Not for interpretation' 
    },
}

export default tags;

export function getTitle(tag) {
    let title = tags[tag]?.title;

    return title || startCase(tag);
}

export function isPublic(tag) {
    return !!tags[tag]?.public;
}
  