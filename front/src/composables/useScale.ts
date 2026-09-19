/**
 * 自适应缩放 composable
 * 按 1920×1080 设计稿等比缩放页面，复用于所有全屏页面。
 *
 * 设计目标（同时满足）：
 *  - 背景完整覆盖、填满屏幕、永不留白边；
 *  - 页面内容（1920×1080 画布）等比缩放铺满整个视口，无论屏幕大小都覆盖整个页面、保持比例位置；
 *  - 任意视口比例下拉伸缩窗口都不拉伸变形（单值等比）。
 *
 * 实现要点：
 *  1) 内容层用「cover 等比缩放」——取 max(宽比, 高比)，整块 1920×1080 画布一定铺满整个视口（覆盖整个页面），
 *     内容随视口等比放大/缩小、保持比例位置、绝不拉伸变形；非 16:9 视口会裁掉画布边缘，
 *     故额外暴露 --crop-x/--crop-y（被裁掉的设计稿边缘量），供内容层/遮罩舞台收进“安全区”，
 *     保证任意比例下重要内容都不被裁；视口级浮动元素经 --page-scale 跟随内容缩放。
 *  2) 背景层由各页独立的 .page-bg（position:fixed + background-size:cover）负责铺满整个视口，
 *     与内容缩放解耦：无论内容缩放多少，背景始终 100% 覆盖、不留白边、不裁切。
 *
 * 注：1920×1080 是页面“设计稿坐标”，内部绝对定位均以此为准，必须保留；
 * “页面显示大小”由外层 flex + 等比缩放动态决定，不再写死。
 */
import { ref, onMounted, onUnmounted } from 'vue'

const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 1080

export function useScale(autoMount = true) {
  const pageStyle = ref({
    width: DESIGN_WIDTH + 'px',
    height: DESIGN_HEIGHT + 'px',
    transform: 'translate(-50%, -50%) scale(1)',
    transformOrigin: 'center center'
  })

  const updateScale = () => {
    // cover 等比缩放：取宽、高缩放比的较大值，整块 1920×1080 画布一定铺满整个视口（覆盖整个页面），
    // 内容随视口等比放大/缩小、保持比例位置、绝不拉伸变形；非 16:9 视口会裁掉画布边缘（多为装饰）。
    const scale = Math.max(
      window.innerWidth / DESIGN_WIDTH,
      window.innerHeight / DESIGN_HEIGHT
    )
    pageStyle.value = {
      width: DESIGN_WIDTH + 'px',
      height: DESIGN_HEIGHT + 'px',
      // 先把 1920×1080 画布中心移到视口中心(由 CSS 的 top:50%/left:50% 提供定位基准)，再等比缩放，
      // 这样 cover 缩放后画布始终以视口为中心铺满、不再向右下偏移(避免内容错位/左上露背景)。
      transform: `translate(-50%, -50%) scale(${scale})`,
      transformOrigin: 'center center'
    }
    // 同步把缩放比写到 :root，供 fixed 层元素（视口贴边按钮等）跟随画布缩放，保持视觉大小一致
    document.documentElement.style.setProperty('--page-scale', String(scale))

    // 计算 cover 缩放下被裁掉的设计稿边缘量（设计稿像素），暴露为安全区变量：
    // 非 16:9 视口会裁掉画布最外圈，把 --crop-x/--crop-y 作为内边距收进安全区，
    // 任何屏幕比例下重要内容都不被裁。16:9 时两者为 0，无影响。
    const dispW = DESIGN_WIDTH * scale
    const dispH = DESIGN_HEIGHT * scale
    const cropX = Math.max(0, (dispW - window.innerWidth) / 2) / scale
    const cropY = Math.max(0, (dispH - window.innerHeight) / 2) / scale
    document.documentElement.style.setProperty('--crop-x', cropX + 'px')
    document.documentElement.style.setProperty('--crop-y', cropY + 'px')
  }

  if (autoMount) {
    onMounted(() => {
      updateScale()
      window.addEventListener('resize', updateScale)
    })
    onUnmounted(() => {
      window.removeEventListener('resize', updateScale)
    })
  }

  return { pageStyle, updateScale }
}
