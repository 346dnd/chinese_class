// 简单的用户状态管理
export const userState = {
  isLoggedIn: false,
  userInfo: null
}

export const login = (studentId, password) => {
  if (studentId && password) {
    userState.isLoggedIn = true
    userState.userInfo = { studentId, name: '学生' }
    localStorage.setItem('userInfo', JSON.stringify(userState.userInfo))
    return true
  }
  return false
}

export const logout = () => {
  userState.isLoggedIn = false
  userState.userInfo = null
  localStorage.removeItem('userInfo')
}

export const checkLogin = () => {
  const saved = localStorage.getItem('userInfo')
  if (saved) {
    try {
      userState.userInfo = JSON.parse(saved)
      userState.isLoggedIn = true
    } catch {
      logout()
    }
  }
}
