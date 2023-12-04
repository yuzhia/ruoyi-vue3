import request from '@/utils/request'

const base = '/server/cluster'

export function treeCluster() {
  return request({
    url: `${base}/tree`,
    method: 'get'
  })
}

// 分页查询模板
export function listCluster(query) {
  return request({
    url: `${base}/list`,
    method: 'get',
    params: query
  })
}

// 添加
export function addCluster(data) {
  return request({
    url: `${base}`,
    method: 'post',
    data
  })
}

export function copyCluster(data) {
  return request({
    url: `${base}/copy`,
    method: 'post',
    data
  })
}

export function testConnect(data) {
  return request({
    url: `${base}/testConnect`,
    method: 'post',
    data
  })
}

export function updateCluster(data) {
  return request({
    url: `${base}`,
    method: 'put',
    data
  })
}

export function delCluster(ids) {
  return request({
    url: `${base}/${ids}`,
    method: 'delete'
  })
}

export function test() {
  return request({
    url: `/client/server/manage/test`,
    method: 'get'
  })
}
