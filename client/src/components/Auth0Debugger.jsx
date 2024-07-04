import { useAuth0 } from "@auth0/auth0-react";
import { useAuthToken } from "../contexts/AuthTokenContext";
import { Helmet } from "react-helmet-async";

export default function Auth0Debugger() {
  const { user } = useAuth0();
  const { accessToken } = useAuthToken();

  return (
      <div className="px-6 py-4">
        <Helmet>
          <title>Auth0 / fakeX</title>
        </Helmet>
        <h1 className="text-2xl font-bold mb-4">Auth0 Debugger</h1>
        <div className="flex flex-col items-center">
          <div className="mb-4">
            <p className="font-semibold">Access Token:</p>
            <pre className="whitespace-pre-wrap break-words bg-gray-100 p-2 rounded-md text-xs max-w-lg overflow-x-auto">
              {JSON.stringify(accessToken, null, 2)}
            </pre>
          </div>
          <div>
            <p className="font-semibold">Auth0 User Info</p>
            <p className="font-light text-gray-500 text-xs">
              Data may be different to hosted database, as updates are
              permitted.
            </p>
            <pre className="whitespace-pre-wrap break-words bg-gray-100 p-2 rounded-md text-xs max-w-lg overflow-x-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        </div>
      </div>
  );
}
