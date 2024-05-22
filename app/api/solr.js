
import ApiBase, { tryCastToApiError } from './api-base';

export default class SolrApi extends ApiBase
{
  constructor(options) {
    super(options);
  }
  
  async query(q, { start, rows, fl, facetField} = {})  {
    const params = {
      q,
      fl,
      start,
      rows,
    };

    if(facetField) {
      params.facet = 'true';
      params['facet.field'] = facetField;
    } 

    const result = await this.http.get(`api/v2013/index`, { params })
                                  .then(res => res.data)
                                  .catch(tryCastToApiError);

    return result;
  }

  escape(value) {
    return escape(value);
  }
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
