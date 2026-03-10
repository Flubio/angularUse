import { createEnvironmentInjector, EnvironmentInjector, InjectionToken, inject, runInInjectionContext } from '@angular/core'
import { TestBed } from '@angular/core/testing'

import { State } from './state'

const TEST_TOKEN = new InjectionToken<string>('TEST_TOKEN')
const SHARED_KEY = Symbol('shared-state-key')

describe('State', () => {
  let service: State

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: TEST_TOKEN, useValue: 'injected-value' }],
    })
    service = TestBed.inject(State)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should initialize global state only once', () => {
    let initCount = 0

    const useGlobalState = service.createGlobalState((initial: number) => {
      initCount++
      return { count: initial }
    })

    const first = useGlobalState(1)
    const second = useGlobalState(999)

    expect(initCount).toBe(1)
    expect(first).toBe(second)
    expect(second.count).toBe(1)
  })

  it('should allow using inject() inside stateFactory', () => {
    const useGlobalState = service.createGlobalState(() => {
      const value = inject(TEST_TOKEN)
      return { value }
    })

    const first = useGlobalState()
    const second = useGlobalState()

    expect(first.value).toBe('injected-value')
    expect(first).toBe(second)
  })

  it('should provide and inject state using createProvidedState', () => {
    const [useProvidingState, useInjectedState] = service.createProvidedState((initial: number) => {
      const tokenValue = inject(TEST_TOKEN)
      return { count: initial, tokenValue }
    })

    expect(useInjectedState()).toBeUndefined()

    const provided = useProvidingState(10)
    const injected = useInjectedState()

    expect(injected).toEqual(provided)
    expect(injected?.count).toBe(10)
    expect(injected?.tokenValue).toBe('injected-value')
  })

  it('should return default value when not provided', () => {
    const [, useInjectedState] = service.createProvidedState(
      (value: number) => ({ value }),
      { defaultValue: { value: 42 } },
    )

    expect(useInjectedState()).toEqual({ value: 42 })
  })

  it('should share state when using the same custom injection key', () => {
    const [provideA] = service.createProvidedState(
      (value: string) => ({ value }),
      { injectionKey: SHARED_KEY },
    )

    const [, injectB] = service.createProvidedState(
      () => ({ value: 'fallback' }),
      { injectionKey: SHARED_KEY },
    )

    const provided = provideA('shared')
    expect(injectB()).toEqual(provided)
  })

  it('should keep createInjectionState as alias of createProvidedState', () => {
    const [provideFromAlias, injectFromAlias] = service.createInjectionState(
      (value: string) => ({ value }),
    )

    const provided = provideFromAlias('alias')
    expect(injectFromAlias()).toEqual(provided)
  })

  it('should share state across callers using createSharedState', () => {
    let initCount = 0
    const useSharedState = service.createSharedState((initial: number) => {
      initCount++
      return { count: initial }
    })

    const first = useSharedState(1)
    const second = useSharedState(999)

    expect(initCount).toBe(1)
    expect(first).toBe(second)
    expect(second.count).toBe(1)
  })

  it('should expose createSharedComposable as alias of createSharedState', () => {
    const fromState = service.createSharedState(() => ({ source: 'state' }))
    expect(fromState).toBeDefined()
  })

  it('should release shared state when all tracked injectors are destroyed', () => {
    let initCount = 0
    const useSharedState = service.createSharedState(() => {
      initCount++
      return { id: initCount }
    })

    const parentInjector = TestBed.inject(EnvironmentInjector)
    const injectorA = createEnvironmentInjector([], parentInjector)
    const injectorB = createEnvironmentInjector([], parentInjector)

    const stateA = runInInjectionContext(injectorA, () => useSharedState())
    const stateB = runInInjectionContext(injectorB, () => useSharedState())

    expect(stateA).toBe(stateB)
    expect(stateA.id).toBe(1)

    injectorA.destroy()
    injectorB.destroy()

    const injectorC = createEnvironmentInjector([], parentInjector)
    const stateC = runInInjectionContext(injectorC, () => useSharedState())

    expect(stateC.id).toBe(2)

    injectorC.destroy()
  })

  it('should resolve immediate useAsyncState execution', async () => {
    const asyncState = service.useAsyncState(
      Promise.resolve('ready'),
      'initial',
    )

    expect(asyncState.state()).toBe('initial')
    expect(asyncState.isLoading()).toBe(true)

    await asyncState.executeImmediate()

    expect(asyncState.state()).toBe('ready')
    expect(asyncState.isReady()).toBe(true)
    expect(asyncState.isLoading()).toBe(false)
    expect(asyncState.error()).toBeUndefined()
  })

  it('should support manual execution when immediate is false', async () => {
    const asyncState = service.useAsyncState(
      async (value: number) => value * 2,
      0,
      { immediate: false },
    )

    expect(asyncState.state()).toBe(0)
    expect(asyncState.isReady()).toBe(false)

    await asyncState.executeImmediate(21)

    expect(asyncState.state()).toBe(42)
    expect(asyncState.isReady()).toBe(true)
    expect(asyncState.isLoading()).toBe(false)
  })

  it('should capture errors and optionally rethrow', async () => {
    const expectedError = new Error('boom')

    const asyncState = service.useAsyncState(
      async () => {
        throw expectedError
      },
      'safe',
      { immediate: false },
    )

    await asyncState.executeImmediate()
    expect(asyncState.error()).toBe(expectedError)
    expect(asyncState.state()).toBe('safe')

    const throwState = service.useAsyncState(
      async () => {
        throw expectedError
      },
      'safe',
      { immediate: false, throwError: true },
    )

    await expect(throwState.executeImmediate()).rejects.toThrow('boom')
  })

  it('should keep the latest execution result only', async () => {
    let resolveFirst!: (value: string) => void
    let resolveSecond!: (value: string) => void

    const asyncFactory = (label: string) => new Promise<string>((resolve) => {
      if (label === 'first')
        resolveFirst = resolve
      else
        resolveSecond = resolve
    })

    const asyncState = service.useAsyncState(asyncFactory, 'init', { immediate: false })

    const first = asyncState.executeImmediate('first')
    const second = asyncState.executeImmediate('second')

    resolveSecond('second-result')
    await second

    resolveFirst('first-result')
    await first

    expect(asyncState.state()).toBe('second-result')
    expect(asyncState.isReady()).toBe(true)
    expect(asyncState.isLoading()).toBe(false)
  })
})
