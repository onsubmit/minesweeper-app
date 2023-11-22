export function getRandomArrayElement<T>(array: Array<T>): T | undefined {
  if (array.length === 0) {
    return undefined;
  }

  return array[Math.floor(Math.random() * array.length)] as T;
}
