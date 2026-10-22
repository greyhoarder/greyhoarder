import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';

/** No answer at all, or a proxy in front of the server answering that the server did not. */
const UNREACHABLE_STATUSES = [
  0,
  HttpStatusCode.BadGateway,
  HttpStatusCode.ServiceUnavailable,
  HttpStatusCode.GatewayTimeout,
];

export function hasStatus(error: unknown, status: HttpStatusCode): boolean {
  return error instanceof HttpErrorResponse && error.status === status;
}

export function isUnreachable(error: unknown): boolean {
  return UNREACHABLE_STATUSES.some((status) => hasStatus(error, status));
}
