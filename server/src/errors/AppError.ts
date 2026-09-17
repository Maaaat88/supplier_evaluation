export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }

  static badRequest(message: string) {
    return new AppError(400, message);
  }

  static unauthorized(message = 'Authentification requise') {
    return new AppError(401, message);
  }

  static forbidden(message = "Vous n'avez pas les droits pour effectuer cette action") {
    return new AppError(403, message);
  }

  static notFound(message = 'Ressource introuvable') {
    return new AppError(404, message);
  }

  static conflict(message: string) {
    return new AppError(409, message);
  }
}
