import request from '@/utils/request'

const base = '/server/region'

// 分页查询模板
export function treeRegion() {
  return request({
    url: `${base}/tree`,
    method: 'get'
  })
}

export function topRegion() {
  return request({
    url: `${base}/top`,
    method: 'get'
  })
}

// 添加
export function addRegion(data) {
  return request({
    url: `${base}`,
    method: 'post',
    data
  })
}

export function updateRegion(data) {
  return request({
    url: `${base}`,
    method: 'put',
    data
  })
}

export function delRegion(ids) {
  return request({
    url: `${base}/${ids}`,
    method: 'delete'
  })
}
