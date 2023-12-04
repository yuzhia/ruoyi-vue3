import request from '@/utils/request'
import qs from 'qs'

const base = '/coupon'

// 分页查询模板
export function listCoupon(query) {
  return request({
    url: `${base}/list`,
    method: 'get',
    params: query
  })
}

// 添加
export function addCoupon(data) {
  return request({
    url: `${base}`,
    method: 'post',
    data
  })
}

export function updateCoupon(data) {
  return request({
    url: `${base}`,
    method: 'put',
    data
  })
}

export function delCoupon(ids) {
  return request({
    url: `${base}/${ids}`,
    method: 'delete'
  })
}
