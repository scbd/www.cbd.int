import _ from 'lodash';
import app from '~/app'

app.filter("areEquals", () => areEquals);

export default function areEquals(a, b, field) {
	const va = field ? _.get(a, field) : a;
    const vb = field ? _.get(b, field) : b;

    if(va === vb) return true;

    if(_.isArray(va) && _.isArray(vb) && va.length == vb.length) {
        const size = va.length

        for(let i=0; i<size; ++i)
            if(!areEquals(va, vb,`[${i}]`)) return false;
        
        return true;
    }

    if(_.isObject(va) && _.isObject(vb)) { 
        const keys = _.union(Object.keys(va), Object.keys(vb));

        for(let key of keys)
            if(!areEquals(va,vb, key)) return false;

        return true;
    }
        
    return false;
}