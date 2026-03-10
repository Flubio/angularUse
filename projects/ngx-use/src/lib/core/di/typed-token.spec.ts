import { EnvironmentInjector, runInInjectionContext } from '@angular/core'
import { TestBed } from '@angular/core/testing'

import { createTypedToken } from './typed-token'

describe('createTypedToken', () => {
  it('should provide and inject a strongly typed value', () => {
    const UserNameToken = createTypedToken<string>('USER_NAME')

    TestBed.configureTestingModule({
      providers: [UserNameToken.provide('flubio')],
    })

    const injector = TestBed.inject(EnvironmentInjector)
    const injected = runInInjectionContext(injector, () => UserNameToken.use())

    expect(injected).toBe('flubio')
  })

  it('should return undefined for useOptional when token is missing', () => {
    const MissingToken = createTypedToken<number>('MISSING_NUMBER')

    TestBed.configureTestingModule({})

    const injector = TestBed.inject(EnvironmentInjector)
    const injected = runInInjectionContext(injector, () => MissingToken.useOptional())

    expect(injected).toBeUndefined()
  })
})
