import { Injectable } from '@angular/core'
import { AnyFn } from '../../../shared'

export type CreateGlobalStateReturn<Fn extends AnyFn = AnyFn> = Fn

/**
 * Keep states in the global scope to be reusable across Angular instances.
 */
@Injectable({
  providedIn: 'root',
})
export class CreateGlobalState {
  /**
   * Creates a global state that persists across component instances.
   * The state factory is called only once on first access.
   *
   * @param stateFactory A factory function to create the state
   * @returns A function that returns the cached state
   *
   * @example
   * ```typescript
   * const useGlobalState = this.createGlobalState.create(() => {
   *   const count = signal(0);
   *   return { count };
   * });
   *
   * // In any component
   * const state = useGlobalState();
   * ```
   */
  create<Fn extends AnyFn>(
    stateFactory: Fn
  ): CreateGlobalStateReturn<Fn> {
    let initialized = false
    let state: any

    return ((...args: any[]) => {
      if (!initialized) {
        state = stateFactory(...args)
        initialized = true
      }
      return state
    }) as Fn
  }
}
