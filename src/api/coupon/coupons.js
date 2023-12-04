import request from '@/utils/request'
import qs from 'qs'

const base = '/coupons'

// 分页查询模板
export function listCoupons(query) {
  return request({
    url: `${base}/list`,
    method: 'get',
    params: query
  })
}

// 添加
export function addCoupons(data) {
  return request({
    url: `${base}`,
    method: 'post',
    data
  })
}

export function updateCoupons(data) {
  return request({
    url: `${base}`,
    method: 'put',
    data
  })
}

export function delCoupons(ids) {
  return request({
    url: `${base}/${ids}`,
    method: 'delete'
  })
}
