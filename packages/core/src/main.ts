import type { TSchema } from '@sinclair/typebox'
import type * as T from './types'
import * as U from './utils'

export async function handleRequest(
  req: Request,
  {
    schema,
    flattenedRoutes,
    handleResponse,
    handleSchemaResponse,
    handleError,
  }: {
    schema: T.Schema
    flattenedRoutes: Record<string, T.Routes>
    handleResponse(response: unknown): Response
    handleSchemaResponse(schema: T.Schema): Response
    handleError(errorMsg: string, status: Response['status']): Response
  },
) {
  const url = new URL(req.url)

  // If it's the schema route, return the JSON Schema
  if (url.pathname === '/__schema') {
    return handleSchemaResponse(schema)
  }

  // Otherwise, find the route and related input data
  const { route, query, body } = await U.getRouteQueryAndBody({
    routes: flattenedRoutes,
    req,
    url,
  })

  // If the route has an onStart function, run it
  route?.onStart?.({ req, query, body })

  // If the route doesn't have a handler, return a 404
  if (!route || !route?.handler) {
    const errorMsg = `Route not found: ${url.pathname}`
    console.error(errorMsg)
    route?.onFinish?.({ req, query, body, response: errorMsg })
    return handleError(errorMsg, 404)
  }

  // If the request is not authorized, return a 401
  if (route.authorizer && !route.authorizer?.({ req, query, body })) {
    const errorMsg = 'Not Authorized'
    console.error(errorMsg)
    route.onFinish?.({ req, query, body, response: errorMsg })
    return handleError(errorMsg, 401)
  }

  // Validate the input against the schema
  try {
    U.validateSchema({
      route,
      query,
      body,
    })
  } catch (err) {
    const error = err as Error
    route.onFinish?.({ req, query, body, response: error.message })
    return handleError(error.message, 400)
  }

  // Get the response
  const response = route.handler({ query, body })

  // If the route has an onFinish function, run it
  route.onFinish?.({ req, query, body, response })

  // Return the handled response
  return handleResponse(response)
}

export function createRoute<
  Q extends TSchema,
  B extends TSchema,
  R extends TSchema,
>(route: T.UserDefinedRoute<Q, B, R>): T.Route {
  return route
}
