import '@testing-library/jest-dom'
import 'vitest-canvas-mock'

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

class IntersectionObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return [] }
}

// @ts-ignore
global.ResizeObserver = ResizeObserverMock as any
// @ts-ignore
global.IntersectionObserver = IntersectionObserverMock as any

// @ts-ignore
global.matchMedia = global.matchMedia || function () {
  return { matches: false, addListener() {}, removeListener() {} }
}


