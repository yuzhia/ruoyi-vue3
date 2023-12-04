import request from '@/utils/request'
import qs from 'qs'

const base = '/server/system'

// 分页查询模板
export function listSystem(query) {
  return request({
    url: `${base}/list`,
    method: 'get',
    params: query
  })
}

// 添加
export function addSystem(data) {
  return request({
    url: `${base}`,
    method: 'post',
    data
  })
}

export function updateSystem(data) {
  return request({
    url: `${base}`,
    method: 'put',
    data
  })
}

export function delSystem(ids) {
  return request({
    url: `${base}/${ids}`,
    method: 'delete'
  })
}

export function bindSystemAndCluster(systemId, clusterIds) {
  return request({
    url: `${base}/bindCluster`,
    method: 'post',
    params: { systemId: systemId, clusterIds: clusterIds },
    paramsSerializer: params => {
      return qs.stringify(params, { indices: false })
    }
  })
}
