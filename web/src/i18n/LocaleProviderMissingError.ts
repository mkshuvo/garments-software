export class LocaleProviderMissingError extends Error {
  public override readonly name = 'LocaleProviderMissingError'

  public constructor() {
    super('The message layer is mounted by LocaleProvider in the root layout; a component used it outside that tree.')
  }
}
