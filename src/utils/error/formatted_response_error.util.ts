export class FormattedResponseError extends Error {
  constructor(
    public status_code: number,
    public message: string
  ) {
    super(message)
  }
}
