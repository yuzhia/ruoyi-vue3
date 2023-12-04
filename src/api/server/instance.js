import request from '@/utils/request'

const base = '/server/instance'

// 分页查询模板
export function listInstance(query) {
  return request({
    url: `${base}/list`,
    method: 'get',
    params: query
  })
}

// 添加
export function addInstance(data) {
  return request({
    url: `${base}`,
    method: 'post',
    data
  })
}

export function updateInstance(data) {
  return request({
    url: `${base}`,
    method: 'put',
    data
  })
}

export function delInstance(ids) {
  return request({
    url: `${base}/${ids}`,
    method: 'delete'
  })
}

export function getInstance(id) {
  return request({
    url: `${base}/${id}`,
    method: 'get'
  })
}

// 分页查询模板
export function listInstanceGroup() {
  return request({
    url: `${base}/group/list`,
    method: 'get'
  })
}

export function saveInstance(data) {
  return request({
    url: `${base}/save`,
    method: 'post',
    data
  })
}
