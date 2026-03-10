import { DestroyRef, EnvironmentInjector, Injectable, inject, runInInjectionContext, signal, WritableSignal } from '@angular/core'
import { AnyFn } from '../../shared'

export type CreateGlobalStateReturn<Fn extends AnyFn = AnyFn> = Fn
export type SharedComposableReturn<Fn extends AnyFn = AnyFn> = Fn

export interface UseAsyncStateOptions<Data> {
  /** Delay for immediate first execution (ms). */
  delay?: number
  /** Execute right away after creation. */
  immediate?: boolean
  /** Reset state to initial value before each execute call. */
  resetOnExecute?: boolean
  /** Callback when execution succeeds. */
  onSuccess?: (data: Data) => void
  /** Callback when execution fails. */
  onError?: (error: unknown) => void
  /** Re-throw the execution error after updating state. */
  throwError?: boolean
}

export interface UseAsyncStateReturn<Data, Params extends Array<any>> {
  state: WritableSignal<Data>
  isReady: WritableSignal<boolean>
  isLoading: WritableSignal<boolean>
  error: WritableSignal<unknown | undefined>
  execute: (delay?: number, ...args: Params) => Promise<Data | undefined>
  executeImmediate: (...args: Params) => Promise<Data | undefined>
}

export type CreateInjectionStateReturn<
  Arguments extends Array<any>,
  ProvideReturn,
  InjectReturn,
> = Readonly<[
  useProvidingState: (...args: Arguments) => ProvideReturn,
  useInjectedState: () => InjectReturn,
]>

export interface CreateInjectionStateOptions<Return> {
  /**
  * Custom key for provided state.
  * Reusing the same key across calls allows shared state.
   */
  injectionKey?: string | symbol
  /**
   * Default value for InjectionState when it has not been provided.
   */
  defaultValue?: Return
}

@Injectable({
  providedIn: 'root',
})
export class State {
  private readonly injectionStateStore = new Map<string | symbol, unknown>()

  constructor(private readonly environmentInjector: EnvironmentInjector) { }

  /**
   * Creates a global state that persists across component instances.
   * The state factory is called only once on first access.
   */
  createGlobalState<Fn extends AnyFn>(
    stateFactory: Fn
  ): CreateGlobalStateReturn<Fn> {
    let initialized = false
    let state: ReturnType<Fn> | undefined

    return ((...args: Parameters<Fn>) => {
      if (!initialized) {
        state = runInInjectionContext(
          this.environmentInjector,
          () => stateFactory(...args)
        )
        initialized = true
      }

      return state as ReturnType<Fn>
    }) as Fn
  }

  /**
   * Creates shared state reused across callers and released when all tracked callers are destroyed.
   */
  createSharedState<Fn extends AnyFn>(stateFactory: Fn): SharedComposableReturn<Fn> {
    let subscribers = 0
    let state: ReturnType<Fn> | undefined

    const dispose = () => {
      subscribers = Math.max(0, subscribers - 1)
      if (subscribers <= 0)
        state = undefined
    }

    return ((...args: Parameters<Fn>) => {
      subscribers += 1

      if (state === undefined) {
        state = runInInjectionContext(this.environmentInjector, () => stateFactory(...args))
      }

      try {
        const destroyRef = inject(DestroyRef, { optional: true })
        destroyRef?.onDestroy(dispose)
      }
      catch {
        // Called outside an injection context; state remains shared until process/service lifetime.
      }

      return state as ReturnType<Fn>
    }) as Fn
  }

  /**
   * Signal-based async state inspired by VueUse `useAsyncState`.
   */
  useAsyncState<Data, Params extends Array<any> = Array<any>>(
    promise: Promise<Data> | ((...args: Params) => Promise<Data>),
    initialState: Data,
    options: UseAsyncStateOptions<Data> = {},
  ): UseAsyncStateReturn<Data, Params> {
    const {
      immediate = true,
      delay = 0,
      resetOnExecute = true,
      onSuccess,
      onError,
      throwError = false,
    } = options

    const state = signal<Data>(initialState)
    const isReady = signal(false)
    const isLoading = signal(false)
    const error = signal<unknown | undefined>(undefined)

    let executionsCount = 0

    const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

    const execute = async (executionDelay = 0, ...args: Params): Promise<Data | undefined> => {
      const executionId = ++executionsCount

      if (resetOnExecute)
        state.set(initialState)

      error.set(undefined)
      isReady.set(false)
      isLoading.set(true)

      if (executionDelay > 0)
        await sleep(executionDelay)

      const currentPromise = typeof promise === 'function'
        ? promise(...args)
        : promise

      try {
        const data = await currentPromise
        if (executionId === executionsCount) {
          state.set(data)
          isReady.set(true)
        }
        onSuccess?.(data)
        return data
      }
      catch (e) {
        if (executionId === executionsCount)
          error.set(e)

        onError?.(e)

        if (throwError)
          throw e

        return undefined
      }
      finally {
        if (executionId === executionsCount)
          isLoading.set(false)
      }
    }

    if (immediate)
      void execute(delay, ...([] as unknown as Params))

    return {
      state,
      isReady,
      isLoading,
      error,
      execute,
      executeImmediate: (...args: Params) => execute(0, ...args),
    }
  }

  createProvidedState<Arguments extends Array<any>, Return>(
    stateFactory: (...args: Arguments) => Return,
    options: { defaultValue: Return } & CreateInjectionStateOptions<Return>,
  ): CreateInjectionStateReturn<Arguments, Return, Return>
  createProvidedState<Arguments extends Array<any>, Return>(
    stateFactory: (...args: Arguments) => Return,
    options?: CreateInjectionStateOptions<Return>,
  ): CreateInjectionStateReturn<Arguments, Return, Return | undefined>


  /**
   * Creates state helpers for a provider/consumer pattern.
   *
   * The first function initializes and stores state from `stateFactory`.
   * The second function reads that stored state (or `defaultValue`).
   */
  createProvidedState<Arguments extends Array<any>, Return>(
    stateFactory: (...args: Arguments) => Return,
    options?: CreateInjectionStateOptions<Return>,
  ): CreateInjectionStateReturn<Arguments, Return, Return | undefined> {
    const key = options?.injectionKey ?? Symbol(stateFactory.name || 'InjectionState')
    const defaultValue = options?.defaultValue

    const useProvidingState = (...args: Arguments) => {
      const state = runInInjectionContext(this.environmentInjector, () => stateFactory(...args))
      this.injectionStateStore.set(key, state)
      return state
    }

    const useInjectedState = () => {
      if (this.injectionStateStore.has(key))
        return this.injectionStateStore.get(key) as Return

      return defaultValue
    }

    return [useProvidingState, useInjectedState]
  }

  /**
   * VueUse-compatible alias for `createProvidedState`.
   */
  createInjectionState<Arguments extends Array<any>, Return>(
    stateFactory: (...args: Arguments) => Return,
    options: { defaultValue: Return } & CreateInjectionStateOptions<Return>,
  ): CreateInjectionStateReturn<Arguments, Return, Return>
  createInjectionState<Arguments extends Array<any>, Return>(
    stateFactory: (...args: Arguments) => Return,
    options?: CreateInjectionStateOptions<Return>,
  ): CreateInjectionStateReturn<Arguments, Return, Return | undefined>
  createInjectionState<Arguments extends Array<any>, Return>(
    stateFactory: (...args: Arguments) => Return,
    options?: CreateInjectionStateOptions<Return>,
  ): CreateInjectionStateReturn<Arguments, Return, Return | undefined> {
    return this.createProvidedState(stateFactory, options as CreateInjectionStateOptions<Return>)
  }
}
