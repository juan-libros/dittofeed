import {
  getRequestContext,
  RequestContextErrorType,
} from "backend-lib/src/requestContext";
import {
  EMAIL_NOT_VERIFIED_PAGE,
  UNAUTHORIZED_PAGE,
  WAITING_ROOM_PAGE,
} from "isomorphic-lib/src/constants";
import { GetServerSideProps } from "next";

import { GetDFServerSideProps, PropsWithInitialState } from "./types";

export const requestContext: <T>(
  gssp: GetDFServerSideProps<PropsWithInitialState<T>>
) => GetServerSideProps<PropsWithInitialState<T>> =
  (gssp) => async (context) => {
    const rc = await getRequestContext(
      context.req.headers.authorization ?? null
    );
    if (rc.isErr()) {
      switch (rc.error.type) {
        case RequestContextErrorType.EmailNotVerified:
          return {
            redirect: {
              destination: EMAIL_NOT_VERIFIED_PAGE,
              permanent: false,
            },
          };
        case RequestContextErrorType.NotOnboarded:
          return {
            redirect: { destination: WAITING_ROOM_PAGE, permanent: false },
          };
        case RequestContextErrorType.Unauthorized:
          return {
            redirect: { destination: UNAUTHORIZED_PAGE, permanent: false },
          };
        case RequestContextErrorType.ApplicationError:
          throw new Error(rc.error.message);
      }
    }
    return gssp(context, rc.value);
  };
