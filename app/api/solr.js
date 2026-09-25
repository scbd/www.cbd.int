
import ApiBase, { tryCastToApiError } from './api-base';

export default class SolrApi extends ApiBase
{
  constructor(options) {
    super(options);
  }
  
  async query(q, { start, rows, fl, facetField, facetQuery, facetLimit, facetMinCount, sort, group, groupField} = {})  {
    const params = {
      q,
      fl,
      start,
      rows,
      sort
    };

    if(facetField) {
      params.facet = 'true';
      params['facet.field'] = facetField;
    } 

    if(facetQuery) {
      params.facet = 'true';
      params['facet.query'] = facetQuery;
    }

    if(Boolean(facetLimit)) params['facet.limit']    = facetLimit;
    if(Boolean(facetMinCount)) params['facet.mincount'] = facetMinCount;

    if(group) {
      params.group           = 'true';
      params['group.field']  = groupField;
      params['group.ngroups']= 'true';
      params['group.limit']  = 0;
    }

    // Facets need repeated keys (`facet.field=a&facet.field=b` and `facet.query=x&facet.query=y`); axios' default
    // serializer emits `facet.field[]=a`, which Solr ignores. Scoped to facet calls so the
    // plain query/paging callers keep axios' encoding untouched.
    const config = { params };
    if(facetField || facetQuery) config.paramsSerializer = repeatArrayKeys;

    const result = await this.http.get(`api/v2013/index`, config)
                                  .then(res => res.data)
                                  .catch(tryCastToApiError);

    return result;
  }

  escape(value) {
    return escape(value);
  }
}

function repeatArrayKeys(params) {
  const params = new URLSearchParams();
  for(const [key, value] of Object.entries(params)) {
    if(value === undefined || value === null || value === '') continue;
    for(const item of (Array.isArray(value) ? value : [value]))
      params.append(key, item);
  }
  return params.toString()
}

export function escape(value) {

  if(value===undefined) throw "Value is undefined";
  if(value===null)      throw "Value is null";
  if(value==="")        throw "Value is null";

  if(_.isNumber(value)) value = value.toString();
  if(_.isDate  (value)) value = value.toISOString();

  //TODO add more types

  value = value.toString();

  value = value.replace(/\\/g,   '\\\\');
  value = value.replace(/\+/g,   '\\+');
  value = value.replace(/\-/g,   '\\-');
  value = value.replace(/\&\&/g, '\\&&');
  value = value.replace(/\|\|/g, '\\||');
  value = value.replace(/\!/g,   '\\!');
  value = value.replace(/\(/g,   '\\(');
  value = value.replace(/\)/g,   '\\)');
  value = value.replace(/\{/g,   '\\{');
  value = value.replace(/\}/g,   '\\}');
  value = value.replace(/\[/g,   '\\[');
  value = value.replace(/\]/g,   '\\]');
  value = value.replace(/\^/g,   '\\^');
  value = value.replace(/\"/g,   '\\"');
  value = value.replace(/\~/g,   '\\~');
  value = value.replace(/\*/g,   '\\*');
  value = value.replace(/\?/g,   '\\?');
  value = value.replace(/\:/g,   '\\:');

  return value;
}
