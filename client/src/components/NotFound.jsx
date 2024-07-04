import { Navigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";

export default function NotFound() {
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRedirect(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (redirect) {
    return <Navigate to="/" />;
  }

  return (
      <div className="py-8 my-auto">
        <Helmet>
          <title>Page not found / fakeX</title>
        </Helmet>
        <div className="mx-auto text-center">
          <h1 className="mb-4 text-9xl font-extrabold">404</h1>
          <p className="mb-4 text-lg font-light text-gray-500">
            Sorry, we can't find that page.
          </p>
          <a
            href="/"
            className="inline-flex text-white bg-blue-500 hover:bg-blue-600 font-medium rounded-lg text-sm px-5 py-2.5 text-center my-2"
          >
            Back to Homepage
          </a>
        </div>
      </div>
  );
}
