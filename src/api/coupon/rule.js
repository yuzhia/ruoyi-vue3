import request from '@/utils/request'
import qs from 'qs'

const base = '/coupon/rule'

// 分页查询模板
export function listRule(query) {
  return request({
    url: `${base}/list`,
    method: 'get',
    params: query
  })
}

export function listServices() {
  return request({
    url: `${base}/services`,
    method: 'get'
  })
}

// 添加
export function addRule(data) {
  return request({
    url: `${base}`,
    method: 'post',
    data
  })
}

export function updateRule(data) {
  return request({
    url: `${base}`,
    method: 'put',
    data
  })
}

export function delRule(ids) {
  return request({
    url: `${base}/${ids}`,
    method: 'delete'
  })
}
