export type Insert<T extends { id: number | string }> = Omit<T, "id">
export type Update<T> = Partial<T>
