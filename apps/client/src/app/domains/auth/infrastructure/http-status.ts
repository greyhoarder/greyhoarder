import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';

/** No answer at all, or a proxy in front of the server answering that the server did not. */
const UNREACHABLE_STATUSES = [
  0,
  HttpStatusCode.BadGateway,
  HttpStatusCode.ServiceUnavailable,
  HttpStatusCode.GatewayTimeout,
];

export function hasStatus(cause: unknown, status: HttpStatusCode): boolean {
  return cause instanceof HttpErrorResponse && cause.status === status;
}

export function isUnreachable(cause: unknown): boolean {
  return UNREACHABLE_STATUSES.some((status) => hasStatus(cause, status));
}
