import request from '@/utils/request'

const base = '/client/server'

export function listRegion() {
  return request({
    url: `${base}/region`,
    method: 'get'
  })
}

export function listCluster(regionId) {
  return request({
    url: `${base}/cluster`,
    method: 'get',
    params: { regionId: regionId }
  })
}

export function getBuyInfo(clusterId) {
  return request({
    url: `${base}/getBuyInfo`,
    method: 'get',
    params: { clusterId: clusterId }
  })
}

export function getDiscount(instanceId) {
  return request({
    url: `${base}/getDiscount`,
    method: 'get',
    params: { instanceId: instanceId }
  })
}

export function getPrice(params) {
  return request({
    url: `${base}/getPrice`,
    method: 'get',
    params: params
  })
}

export function buy(data) {
  return request({
    url: `${base}/buy`,
    method: 'post',
    data
  })
}
