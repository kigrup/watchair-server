export const getFileExtension = (fileName: string): string | null => {
  const fileExtensionRegex = /\.[0-9a-z]+$/i

  const match: RegExpMatchArray | null = fileName.match(fileExtensionRegex)

  if (match === null) {
    return null
  }

  return match[0]
}
