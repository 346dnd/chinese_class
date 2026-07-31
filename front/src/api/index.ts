// ============= 类型定义 =============

export interface StageTask {
  id: string
  name: string
  active: boolean
  finished: boolean
}

export interface StageModule {
  id: string
  name: string
  color: string
  tasks: StageTask[]
}

export interface FillBlankQuestion {
  articleId: string
  articleName: string
  blanks: number
  correctAnswers: string[]
  template: string
}

export interface WriteFeelArticle {
  id: string
  hintText1: string
  hintText2: string
}

export interface ExpressStep {
  step: number
  question: string
  correctAnswer: string
}

export interface ArticleContent {
  id: string
  title: string
  content: string
}

// ============= 模拟数据 =============

const mockStageModules: StageModule[] = [
  {
    id: 'preview',
    name: '项目策划会',
    color: '#F7D76B',
    tasks: [
      { id: 'write-feel', name: '写写感想', active: true, finished: false },
      { id: 'fill-blank', name: '初步感悟', active: false, finished: false }
    ]
  },
  {
    id: 'warmup',
    name: '素材采风：纸的逆袭',
    color: '#EDF5E6',
    tasks: [
      { id: 'warmup-game', name: '重温文化互动', active: false, finished: false }
    ]
  },
  {
    id: 'method',
    name: '编剧大师课',
    color: '#EDF5E6',
    tasks: [
      { id: 'zhaozhouqiao', name: '学习《赵州桥》的表达方法', active: false, finished: false },
      { id: 'qingming', name: '学习《一幅名扬中外的画》的表达方法', active: false, finished: false }
    ]
  },
  {
    id: 'creation',
    name: '节目制作工坊',
    color: '#293320ff',
    tasks: [
      { id: 'creation-main', name: '宣传文化创作', active: false, finished: false }
    ]
  },
  {
    id: 'homework',
    name: '下期预告',
    color: '#EDF5E6',
    tasks: [
      { id: 'homework-main', name: '传承文化任务', active: false, finished: false }
    ]
  }
]

const mockFillBlankQuestions: FillBlankQuestion[] = [
  {
    articleId: 'bridge',
    articleName: '赵州桥',
    blanks: 5,
    correctAnswers: ['结构特点', '设计原理', '造型', '美观', '坚固'],
    template: '在《赵州桥》的课文中，作者详细介绍了桥面____、桥洞的____，把每种____的____写得清清楚楚。'
  },
  {
    articleId: 'painting',
    articleName: '一幅名扬中外的画',
    blanks: 4,
    correctAnswers: ['人物', '场景', '内容', '细节'],
    template: '在《一幅名扬中外的画》的课文中，作者详细介绍了画上的____、____，把画面的____和____写得清清楚楚。'
  },
  {
    articleId: 'paper',
    articleName: '纸的发明',
    blanks: 3,
    correctAnswers: ['历史', '原料', '制作'],
    template: '在《纸的发明》的课文中，作者详细介绍了纸的____、____，以及纸的____过程。'
  }
]

const mockWriteFeelArticles: WriteFeelArticle[] = [
  {
    id: 'paper',
    hintText1: '在《纸的发明》中，是哪些让你感到自豪？',
    hintText2: ''
  },
  {
    id: 'bridge',
    hintText1: '在《赵州桥》里，哪些方面让你感到自豪？',
    hintText2: ''
  },
  {
    id: 'painting',
    hintText1: '《一幅名扬中外的画》哪些细节让你感到自豪？',
    hintText2: ''
  }
]

const mockZGQSteps: ExpressStep[] = [
  {
    step: 1,
    question: '在《赵州桥》的第3自然段里，一个意思指的是：',
    correctAnswer: '美观'
  },
  {
    step: 2,
    question: '根据这一个意思写一句中心句：',
    correctAnswer: '这座桥不但坚固，而且美观'
  },
  {
    step: 3,
    question: '围绕这中心句，后面每一句话写的内容都跟这个意思有关。可以用上修辞手法，可以用事例或细节来写具体。请你读读中心句后面的句子，体会这种写法。',
    correctAnswer: ''
  }
]

const mockHUAQuestions = [
  { label: '①先确定一个意思。' },
  { label: '②根据这个意思写一句中心句。' },
  { label: '③围绕中心句，后面每一句话写的内容都跟这个意思有关。可以用上修辞手法，可以用事例或细节把内容写具体。' }
]

const mockArticles: ArticleContent[] = [
  {
    id: 'bridge',
    title: '赵州桥',
    content: `赵州桥，又称安济桥，位于河北省石家庄市。赵州桥建于隋朝年间，由著名匠师李春设计建造，距今已有1400多年的历史，是当今世界上现存最早、保存最完整的古代单孔敞肩石拱桥。
赵州桥的桥洞不是普通的半圆形，而是像一张弓，因而大拱上面的道路没有陡坡，便于车马上下。
赵州桥非常雄伟。桥长五十多米，有九米多宽，中间行车马，两旁走人。这么长的桥，全部用石头砌成，下面没有桥墩，只有一个拱形的大桥洞，横跨在三十七米多宽的河面上。
赵州桥体现了劳动人民的智慧和才干，是我国宝贵的历史文化遗产。`
  },
  {
    id: 'painting',
    title: '一幅名扬中外的画',
    content: `《清明上河图》是北宋画家张择端画的一幅画。这幅画描绘了北宋都城汴京的热闹景象。
画面上的人物很多，有农民、船工、商人、读书人，还有骑着毛驴的、推着小车的……街上有挂着各种招牌的店铺，有热闹的街市，有横跨汴河的大桥。
这幅画已经名扬中外，让人看到了八百多年前古都的风貌。`
  },
  {
    id: 'paper',
    title: '纸的发明',
    content: `纸的发明是中国对世界文明的伟大贡献之一。
早在两千多年前，我们的祖先就已经发明了纸。那时候，人们把字写在竹简上，或者写在帛上。竹简太笨重，帛又太贵。后来，人们开始用麻造纸。
东汉时期，蔡伦改进了造纸术。他用树皮、麻头、破布、旧渔网等原料造纸，大大提高了纸的质量，降低了成本。
纸的发明促进了文化的传播和发展，对世界文明做出了重要贡献。`
  }
]

// ============= API 接口 =============

/** 获取首页阶段模块数据 */
export const getStageModules = (): Promise<StageModule[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockStageModules), 300)
  })
}

/** 获取填空题目列表 */
export const getFillBlankQuestions = (): Promise<FillBlankQuestion[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockFillBlankQuestions), 300)
  })
}

/** 校验填空答案 */
export const validateFillBlankAnswers = (
  articleId: string,
  answers: string[]
): Promise<{ results: ('correct' | 'wrong')[] }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const question = mockFillBlankQuestions.find(q => q.articleId === articleId)
      if (!question) {
        resolve({ results: answers.map(() => 'wrong' as const) })
        return
      }
      const results = answers.map((ans, i) =>
        ans.trim() === question.correctAnswers[i] ? 'correct' as const : 'wrong' as const
      )
      resolve({ results })
    }, 300)
  })
}

/** 获取写写感想文章提示 */
export const getWriteFeelArticles = (): Promise<WriteFeelArticle[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockWriteFeelArticles), 300)
  })
}

/** 提交感想 */
export const submitFeel = (
  articleId: string,
  content: string
): Promise<{ success: boolean; feedback: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        feedback: `你写的"${content.slice(0, 20)}..."很有想法！继续保持！`
      })
    }, 500)
  })
}

/** 获取赵州桥表达方法步骤 */
export const getZGQSteps = (): Promise<ExpressStep[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockZGQSteps), 300)
  })
}

/** 校验赵州桥步骤答案 */
export const validateZGQAnswer = (
  step: number,
  answer: string
): Promise<{ correct: boolean; correctAnswer: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const stepData = mockZGQSteps.find(s => s.step === step)
      const correctAnswer = stepData?.correctAnswer || ''
      resolve({
        correct: answer.trim() === correctAnswer,
        correctAnswer
      })
    }, 300)
  })
}

/** 获取一幅名扬中外的画表达方法问题 */
export const getHUAQuestions = (): Promise<{ label: string }[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockHUAQuestions), 300)
  })
}

/** 校验表达方法答案 */
export const validateHUAAnswers = (
  answers: string[]
): Promise<{ results: ('correct' | 'wrong')[] }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const results = answers.map(a =>
        a.trim().length > 0 ? 'correct' as const : 'wrong' as const
      )
      resolve({ results })
    }, 300)
  })
}

/** 获取课文内容 */
export const getArticleContent = (articleId: string): Promise<ArticleContent | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const article = mockArticles.find(a => a.id === articleId)
      resolve(article || null)
    }, 300)
  })
}
