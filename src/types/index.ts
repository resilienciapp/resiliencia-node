export type OptionalExceptFor<T, K extends keyof T> = Partial<T> & Pick<T, K>
