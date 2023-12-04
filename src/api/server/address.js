import request from '@/utils/request'
import qs from 'qs'

const base = '/server/ipPool'

// 分页查询模板
export function listPool(query) {
  return request({
    url: `${base}/list`,
    method: 'get',
    params: query
  })
}

// 添加
export function addPool(data) {
  return request({
    url: `${base}`,
    method: 'post',
    data
  })
}

export function updatePool(data) {
  return request({
    url: `${base}`,
    method: 'put',
    data
  })
}

export function delPool(ids) {
  return request({
    url: `${base}/${ids}`,
    method: 'delete'
  })
}

export function bindPoolAndCluster(poolId, clusterIds) {
  return request({
    url: `${base}/bindCluster`,
    method: 'post',
    params: { poolId: poolId, clusterIds: clusterIds },
    paramsSerializer: params => {
      return qs.stringify(params, { indices: false })
    }
  })
}

// IP

export function listAddress(query) {
  return request({
    url: `/server/ipAddress/list`,
    method: 'get',
    params: query
  })
}

export function addAddress(data) {
  return request({
    url: `/server/ipAddress`,
    method: 'post',
    data
  })
}

export function updateAddress(data) {
  return request({
    url: `/server/ipAddress`,
    method: 'put',
    data
  })
}

export function delAddress(ids) {
  return request({
    url: `/server/ipAddress/${ids}`,
    method: 'delete'
  })
}
