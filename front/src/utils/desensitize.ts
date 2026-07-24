export const desensitizeName = (name: string): string => {
  if (!name || name.length <= 1) return name
  if (name.length === 2) {
    return name[0] + '*'
  }
  return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1]
}

export const desensitizeStudentId = (studentId: string): string => {
  if (!studentId || studentId.length <= 4) return studentId
  return studentId.substring(0, 2) + '*'.repeat(studentId.length - 4) + studentId.substring(studentId.length - 2)
}

export const desensitizeContent = (content: string): string => {
  const sensitiveWords = ['敏感词1', '敏感词2', '敏感词3']
  let result = content
  sensitiveWords.forEach(word => {
    result = result.replace(new RegExp(word, 'g'), '*'.repeat(word.length))
  })
  return result
}

export const desensitize = (data: any, type: 'log' | 'display' | 'export'): any => {
  if (typeof data === 'string') {
    return desensitizeContent(data)
  }
  if (typeof data === 'object' && data !== null) {
    const result: any = Array.isArray(data) ? [] : {}
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        if (key.toLowerCase().includes('name')) {
          result[key] = desensitizeName(String(data[key]))
        } else if (key.toLowerCase().includes('id') && (key.toLowerCase().includes('student') || key.toLowerCase().includes('user'))) {
          if (type === 'export') {
            result[key] = data[key]
          } else {
            result[key] = desensitizeStudentId(String(data[key]))
          }
        } else {
          result[key] = desensitize(data[key], type)
        }
      }
    }
    return result
  }
  return data
}
