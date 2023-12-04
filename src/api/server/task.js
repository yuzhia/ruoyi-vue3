import request from '@/utils/request'

const base = '/server/task'

export function createVM(data) {
  return request({
    url: `${base}`,
    method: 'post',
    data
  })
}
