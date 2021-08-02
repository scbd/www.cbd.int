import ApiBase, { tryCastToApiError } from './api-base.js'

export default class DecisionApi extends ApiBase
{
  constructor(options) {
    super(options);
  }

  async getDecision(decisionCodeOrId) {

    const result = await this.http.get(`api/v2021/decisions/${encodeURIComponent(decisionCodeOrId)}`).then(res => res.data).catch(tryCastToApiError);

    return result;
  }
  
  async queryDecisionNodes(decisionCodeOrId) {

    const result = await this.http.get(`api/v2021/decisions/${encodeURIComponent(decisionCodeOrId)}/nodes`).then(res => res.data).catch(tryCastToApiError);

    return result;
  }

  async queryDecisionTree(decisionCodeOrId) {

    const result = await this.http.get(`api/v2021/decisions/${encodeURIComponent(decisionCodeOrId)}/tree`, {cache:true }).then(res => res.data).catch(tryCastToApiError);

    return result;
  }

  async updateDecisionNode(decisionId, nodeId, data) {
    return this.http.put(`api/v2021/decisions/${encodeURIComponent(decisionId)}/nodes/${encodeURIComponent(nodeId)}`, data).then(res => res.data).catch(tryCastToApiError);
  }

  async getTreaties(code) {
    
    const result = await this.http.get(`api/v2015/treaties/${encodeURIComponent(code)}`, { cache: true }).then(res => res.data).catch(tryCastToApiError);

    return result;
  }

  async getDecisionDocuments(params) {
    
    const result = await this.http.get('api/v2013/index', { params });

    return result;
  }

  async getRelatedDecisions(params) {
    
    const result = await this.http.get('api/v2016/decision-texts/search', { params });

    return result;
  }

  async getDecisionComments(params) {
    const result = await this.http.get('api/v2017/comments', { params });
    return result;
  }

  async addNodeToDecisionTree(decisionCodeOrId, params) {
    const result = await this.http.post(`api/v2021/decisions/${encodeURIComponent(decisionCodeOrId)}/nodes`, params);
    return result
  }
}