import { trace } from "@gcorevideo/player"

type ResizeCallback = ({
  width,
  height,
}: {
  width: number
  height: number
}) => void

export default function useResizeObserver(
  onresize: ResizeCallback
) {
  const rob = new ResizeObserver((entries) => {
    for (const entry of entries) {
      if (entry.borderBoxSize?.length > 0) {
        const { inlineSize, blockSize } = entry.borderBoxSize[0]
        if (inlineSize === 0 || blockSize === 0) {
          trace('composables.use-resize-observer zero size', { width: inlineSize, height: blockSize })
        } else {
          onresize({ width: inlineSize, height: blockSize })
          break
        }
      }
    }
  })
  return {
    start(node: HTMLElement) {
      rob.observe(node, { box: 'border-box' })
    },
    stop() {
      rob.disconnect()
    },
  }
}
