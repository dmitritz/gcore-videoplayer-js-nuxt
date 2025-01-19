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
        onresize({ width: inlineSize, height: blockSize })
        break
      }
    }
  })
  return {
    start(node: HTMLElement) {
      rob.observe(node)
    },
    stop() {
      rob.disconnect()
    },
  }
}
