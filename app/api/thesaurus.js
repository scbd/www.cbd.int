
import ApiBase, { tryCastToApiError, stringifyUrlParam} from './api-base';

export default class ThesaurusApi extends ApiBase
{
  
  constructor(options) {
    super(options);
  }

  async getDomains()  { 
    return this.http.get(`/api/v2013/thesaurus/domains`)
      .then(res => res.data)
      .catch(tryCastToApiError);
  }
  
  async getDomain(domainId)  {     
    if(!domainId) throw Error(`invalid value for identifier`);

    return this.http.get(`/api/v2013/thesaurus/domains/${encodeURIComponent(domainId)}` )
                    .then(res => res.data)
                    .catch(tryCastToApiError);   
  }

  async getDomainTerms(domainId, { relations } = {})  {    
    if(!domainId) throw Error(`invalid value for identifier`);

    const params= { };
    if(relations) params.relations = stringifyUrlParam(relations);

    return this.http.get(`/api/v2013/thesaurus/domains/${encodeURIComponent(domainId)}/terms`, { params } )
                    .then(res => res.data)
                    .catch(tryCastToApiError);
  }
  
  async getTerm(identifier, { relations } = {})  {    
    if(!identifier) throw Error(`invalid value for identifier`);  

    const params= { }; 
    if(relations) params.relations = stringifyUrlParam(relations);

    return this.http.get(`/api/v2013/thesaurus/terms/${encodeURIComponent(identifier)}`,  { params } )
                    .then(res => res.data)
                    .catch(tryCastToApiError); 
  }
 }