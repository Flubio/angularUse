import { inject, InjectionToken, type InjectOptions, type ValueProvider } from '@angular/core'

export interface TypedTokenHelper<T> {
  /**
   * Underlying Angular injection token.
   */
  readonly token: InjectionToken<T>
  /**
   * Creates a strongly typed provider for this token.
   */
  provide(value: T): ValueProvider
  /**
   * Injects the token value and throws if not found (Angular default behavior).
   */
  use(options?: Omit<InjectOptions, 'optional'>): T
  /**
   * Injects the token value as optional and returns undefined when not found.
   */
  useOptional(options?: Omit<InjectOptions, 'optional'>): T | undefined
}

/**
 * Creates a strongly typed token helper with provider and injector utilities.
 */
export function createTypedToken<T>(description: string): TypedTokenHelper<T> {
  const token = new InjectionToken<T>(description)

  const provide = (value: T): ValueProvider => ({
    provide: token,
    useValue: value,
  })

  const use = (options?: Omit<InjectOptions, 'optional'>): T => {
    const value = inject<T | null>(token, {
      ...(options ?? {}),
      optional: false,
    })

    return value as T
  }

  const useOptional = (options?: Omit<InjectOptions, 'optional'>): T | undefined => {
    const value = inject<T | null>(token, { ...options, optional: true })
    return value ?? undefined
  }

  return {
    token,
    provide,
    use,
    useOptional,
  }
}
