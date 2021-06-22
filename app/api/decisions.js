import ApiBase, { tryCastToApiError } from './api-base.js'

export default class DecisionApi extends ApiBase
{
  constructor(options) {
    super(options);
  }

  async queryDecisionNodes(decisionId) {

    const nodes = await this.http.get(`api/v2021/decisions/${encodeURIComponent(decisionId)}/nodes`).then(res => res.data).catch(tryCastToApiError);

    return nodes;
  }

  async updateDecisionNode(decisionId, nodeId, data) {
    return this.http.put(`api/v2021/decisions/${encodeURIComponent(decisionId)}/nodes/${encodeURIComponent(nodeId)}`, data).then(res => res.data).catch(tryCastToApiError);
  }
}