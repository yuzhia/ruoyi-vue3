import request from '@/utils/request'

const base = '/server/log'

// 查询任务列表
export function listServerLog(query) {
  return request({
    url: `${base}/list`,
    method: 'get',
    params: query
  })
}

// 重启任务
export function restartTask(logId) {
  return request({
    url: `${base}/${logId}/restart`,
    method: 'post'
  })
}
