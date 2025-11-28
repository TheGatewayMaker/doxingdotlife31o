import serverless from "serverless-http";
import { createServer } from "../../server";

let app: any;

const getApp = () => {
  if (!app) {
    try {
      app = createServer();
    } catch (error) {
      console.error("Failed to create server:", error);
      throw error;
    }
  }
  return app;
};

export const handler = async (event: any, context: any) => {
  try {
    const app = getApp();
    const serverlessHandler = serverless(app, {
      basePath: "/.netlify/functions/api",
      binary: [
        "image/*",
        "video/*",
        "application/octet-stream",
        "multipart/form-data",
      ],
      request(request: any) {
        // Ensure the request body is properly passed through
        if (!request.body) {
          request.body = "";
        }
        return request;
      },
    });

    return await serverlessHandler(event, context);
  } catch (error) {
    console.error("Handler error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
      headers: { "Content-Type": "application/json" },
    };
  }
};
